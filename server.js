const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(cors());
app.use(express.json({limit:'10mb'}));
app.use(express.urlencoded({extended:true}));

// serve client files
app.use(express.static(path.join(__dirname)));

const DATA_DIR = path.join(__dirname, 'data');
const IMAGES_DIR = path.join(__dirname, 'images');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true});
if(!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR,{recursive:true});

const INVENTORY_FILE = path.join(DATA_DIR, 'inventory_server.json');
const USERS_FILE = path.join(DATA_DIR, 'usuarios_server.json');
const LOG_FILE = path.join(DATA_DIR, 'log_server.json');

// Optional: Apps Script endpoint to forward items (set your deployed exec URL)
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzKLSsxgIP8H__ZSLr5yHD086tCQyKR836ojE9dYBH1aMd2Tt02pyzwgHpI013jy2DK/exec';
// Map server categories to inventory IDs expected by Apps Script
const CATEGORY_TO_INVENTORY = { aluminio: '1', herrajes: '2', vidrio: '3', insumos: '4' };

function readJson(file, fallback){ try{ if(fs.existsSync(file)) return JSON.parse(fs.readFileSync(file,'utf8')||'{}'); }catch(e){ console.error('readJson error',e); } return fallback; }
function writeJson(file, obj){ fs.writeFileSync(file, JSON.stringify(obj,null,2),'utf8'); }

// init files
if(!fs.existsSync(INVENTORY_FILE)) writeJson(INVENTORY_FILE, {vidrio:[],aluminio:[],herrajes:[],insumos:[]});
if(!fs.existsSync(USERS_FILE)) writeJson(USERS_FILE, {});
if(!fs.existsSync(LOG_FILE)) writeJson(LOG_FILE, []);

// static images
app.use('/images', express.static(IMAGES_DIR));

app.get('/api/ping', (req,res)=> res.json({ok:true}));

app.get('/api/inventory', (req,res)=>{
  const inv = readJson(INVENTORY_FILE, {vidrio:[],aluminio:[],herrajes:[],insumos:[]});
  res.json(inv);
});

app.put('/api/inventory', (req,res)=>{
  const body = req.body || {};
  writeJson(INVENTORY_FILE, body);
  io.emit('inventory-updated', body);
  // export CSV snapshot
  try{ exportInventoryCSV(body); }catch(e){ console.warn('CSV export failed',e); }
  res.json({ok:true});
});

// multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const cat = (req.body.category || 'otros').toString();
    const dir = path.join(IMAGES_DIR, cat);
    if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^a-z0-9.\-\_]/gi,'_');
    cb(null, `${ts}_${safe}`);
  }
});
const upload = multer({ storage: storage });

// add single item (with optional image file)
app.post('/api/item', upload.single('image'), (req,res)=>{
  try{
    const body = req.body || {};
    const inv = readJson(INVENTORY_FILE, {vidrio:[],aluminio:[],herrajes:[],insumos:[]});
    const cat = body.category || 'otros';
    const item = JSON.parse(body.item || '{}');
    if(req.file){
      item.imagePath = `/images/${cat}/${req.file.filename}`;
      item.imageName = req.file.originalname;
    }
    if(!inv[cat]) inv[cat]=[];
    inv[cat].push(item);
    writeJson(INVENTORY_FILE, inv);
    io.emit('inventory-updated', inv);
    try{ exportInventoryCSV(inv); }catch(e){ console.warn('CSV export failed',e); }
    res.json({ok:true, inventory:inv});

    // Forward to Apps Script (non-blocking)
    try{
      // prepare payload matching Apps Script expectations
      const invId = CATEGORY_TO_INVENTORY[cat] || '1';
      const payload = {
        inventory: invId,
        category: cat,
        name: item.nombre || item.linea || item.nombre || '',
        sku: item.codigo || item.serie || '',
        quantity: item.cantidad || 0,
        notes: JSON.stringify(item)
      };
      if(req.file){
        const fpath = req.file.path;
        const buffer = fs.readFileSync(fpath);
        payload.imageBase64 = buffer.toString('base64');
        payload.imageName = req.file.originalname;
        payload.imageMime = req.file.mimetype || 'application/octet-stream';
      }
      // send JSON POST to GAS_URL
      const u = new URL(GAS_URL);
      const https = require('https');
      const data = JSON.stringify(payload);
      const options = {
        hostname: u.hostname,
        path: u.pathname + (u.search || ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      const reqG = https.request(options, (resp)=>{
        let respData = '';
        resp.on('data', chunk=> respData += chunk);
        resp.on('end', ()=>{ try{ console.log('Forwarded item to Apps Script, status', resp.statusCode); }catch(e){} });
      });
      reqG.on('error', err=> console.warn('Error forwarding to Apps Script', err));
      reqG.write(data);
      reqG.end();
    }catch(fwdErr){ console.warn('Forward to Apps Script failed', fwdErr); }
  }catch(e){ console.error('POST /api/item error',e); res.status(500).json({ok:false,error:String(e)}); }
});

function exportInventoryCSV(inventoryObj){
  const out = [];
  out.push(['category','id','item_json'].join(','));
  for(const cat in inventoryObj){
    (inventoryObj[cat]||[]).forEach(it=>{
      const id = it.id || '';
      const text = JSON.stringify(it).replace(/\n/g,' ').replace(/"/g,'""');
      out.push([cat, id, `"${text}"`].join(','));
    });
  }
  fs.writeFileSync(path.join(DATA_DIR,'inventory_export.csv'), out.join('\n'),'utf8');
}

// get users and log basic endpoints
app.get('/api/usuarios', (req,res)=>{ res.json(readJson(USERS_FILE,{})); });
app.get('/api/log', (req,res)=>{ res.json(readJson(LOG_FILE,[])); });

// append log entry
app.post('/api/log', (req,res)=>{ const l = readJson(LOG_FILE,[]); l.push(req.body); writeJson(LOG_FILE,l); io.emit('log-updated', l); res.json({ok:true}); });

const PORT = process.env.PORT || 3000;
http.listen(PORT, ()=> console.log('Server listening on', PORT));
