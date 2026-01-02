// Google Apps Script: Code.gs
// Paste this into your Apps Script project and deploy as Web App (Execute as: Me, Who has access: Anyone, even anonymous)

const SHEET_ID = '1vDvmEj8wdTNV-xEfo2u4rL-0vk4pJWtncq65wKN6PT0'; // <-- update to your spreadsheet ID
const INVENTORY_SHEETS = {
  '1': 'Aluminio',
  '2': 'Herrajes',
  '3': 'Vidrio',
  '4': 'Insumos'
};
const USERS_SHEET_NAME = 'Usuarios'; // Nueva hoja para usuarios
const LOG_SHEET_NAME = 'Bitacora'; // Hoja para registro de movimientos

// Map inventory id -> Drive folder ID where images will be stored. Create these folders in your Drive and set IDs here.
const FOLDER_IDS = {
  '1': '1cEpdyWNNCj_O2LvIpeGxfQ2W1j_7Nz7P',
  '2': '1uUMdMcyDLPxadPaRoR1h8xGoBL8oY4ab',
  '3': '1oQb9NC6afQbHLSqDcNi-0wS9Zlhb9Bgc',
  '4': '1VEy2BrBODwA50353mrp0IhhTFq4LRyUv'
};

// Header aliases to support English/Spanish header names in Sheets
const HEADER_ALIASES = {
  timestamp: ['timestamp','fecha','date','time'],
  inventoryId: ['inventoryid','inventoryid','inventory','inventario','inventoryId'],
  category: ['category','categoria'],
  name: ['name','nombre','producto','item'],
  sku: ['sku','codigo','code','id','referencia'],
  quantity: ['quantity','cantidad','qty','stock','existencia'],
  notes: ['notes','nota','notas','descripcion','detalles'],
  imageUrl: ['imageurl','image','imagen','url','imageurl','foto'],
  // Extended aliases for specific categories
  color: ['color','colour','acabado','colores'],
  tipo: ['tipo','type','clase','tipos'],
  grosor: ['grosor','thickness','calibre','espesor','mm'],
  medida: ['medida','size','dimension','dimensiones','medidas'],
  medida1: ['medida1','ancho','width','base'],
  medida2: ['medida2','alto','largo','height','length','altura'],
  forma: ['forma','shape','perfil','formas'],
  linea: ['linea','line','lineas','línea'],
  serie: ['serie','series']
};

function buildHeaderMap(headers){
  const map = {};
  // defend against invalid input: ensure headers is an array
  if(!Array.isArray(headers)) headers = [];
  const lower = headers.map(h => (h||'').toString().trim().toLowerCase());
  for(const canonical in HEADER_ALIASES){
    const aliases = HEADER_ALIASES[canonical] || [];
    
    // 1. Try exact match first
    let idx = -1;
    for(const alias of aliases){
        const a = (alias||'').toString().toLowerCase();
        const exact = lower.indexOf(a);
        if(exact !== -1) { idx = exact; break; }
    }
    
    // 2. If no exact match, try partial match (header contains alias)
    if(idx === -1){
        for(const alias of aliases){
            const a = (alias||'').toString().toLowerCase();
            // findIndex is better here
            const partial = lower.findIndex(h => h.includes(a));
            if(partial !== -1) { idx = partial; break; }
        }
    }

    if(idx !== -1) map[canonical] = idx;
  }
  // also include raw header name map for any unmatched headers
  lower.forEach((h,i)=>{ if(!Object.values(map).includes(i)) map[h] = i; });
  return map;
}

function doGet(e){
  try{
    const q = e.parameter || {};
    
    // New optimized action to fetch all inventories in one go
    if(q.action === 'listAll'){
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const result = {};
      
      // Iterate over all defined inventory IDs
      for(const invId in INVENTORY_SHEETS){
        const name = INVENTORY_SHEETS[invId];
        const sh = ss.getSheetByName(name);
        if(sh){
          const data = sh.getDataRange().getValues();
          const headers = data.shift() || [];
          const headerMap = buildHeaderMap(headers);
          const rows = data.map(r => {
            const obj = {};
            // canonical keys
            Object.keys(HEADER_ALIASES).forEach(k => {
              const idx = headerMap[k];
              obj[k] = (idx !== undefined && idx !== -1) ? r[idx] : null;
            });
            // also expose original header names
            headers.forEach((h,i)=> obj[h] = r[i]);
            return obj;
          });
          result[invId] = rows;
        } else {
          result[invId] = [];
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ok:true, data:result})).setMimeType(ContentService.MimeType.JSON);
    }

    if(q.action === 'list' && q.inventory){
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const name = INVENTORY_SHEETS[q.inventory] || null;
      if(!name) return ContentService.createTextOutput(JSON.stringify({error:'Inventario inválido'})).setMimeType(ContentService.MimeType.JSON);
      const sh = ss.getSheetByName(name);
      if(!sh) return ContentService.createTextOutput(JSON.stringify({error:'Hoja no encontrada'})).setMimeType(ContentService.MimeType.JSON);
      const data = sh.getDataRange().getValues();
      const headers = data.shift() || [];
      const headerMap = buildHeaderMap(headers);
      const rows = data.map(r => {
        const obj = {};
        // canonical keys
        Object.keys(HEADER_ALIASES).forEach(k => {
          const idx = headerMap[k];
          obj[k] = (idx !== undefined && idx !== -1) ? r[idx] : null;
        });
        // also expose original header names for backwards compatibility
        headers.forEach((h,i)=> obj[h] = r[i]);
        return obj;
      });
      const out = {ok:true,rows:rows};
      if(q.callback){
        return ContentService.createTextOutput(q.callback + '(' + JSON.stringify(out) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
    }
    // Return single row by SKU
      if(q.action === 'get' && q.inventory && q.sku){
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const name = INVENTORY_SHEETS[q.inventory] || null;
      if(!name) return ContentService.createTextOutput(JSON.stringify({error:'Inventario inválido'})).setMimeType(ContentService.MimeType.JSON);
      const sh = ss.getSheetByName(name);
      if(!sh) return ContentService.createTextOutput(JSON.stringify({error:'Hoja no encontrada'})).setMimeType(ContentService.MimeType.JSON);
      const data = sh.getDataRange().getValues();
      const headers = data.shift() || [];
      const headerMap = buildHeaderMap(headers);
      const skuIndex = headerMap['sku'];
      if(skuIndex === undefined || skuIndex === -1) return ContentService.createTextOutput(JSON.stringify({error:'Columna sku no encontrada'})).setMimeType(ContentService.MimeType.JSON);
      const row = data.find(r => String(r[skuIndex]) === String(q.sku));
      if(!row) return ContentService.createTextOutput(JSON.stringify({ok:true,row:null})).setMimeType(ContentService.MimeType.JSON);
      const obj = {};
      // canonical keys
      Object.keys(HEADER_ALIASES).forEach(k => {
        const idx = headerMap[k];
        obj[k] = (idx !== undefined && idx !== -1) ? row[idx] : null;
      });
      // also include original header names
      headers.forEach((h,i)=> obj[h] = row[i]);
      const outObj = {ok:true,row:obj};
      if(q.callback){
        return ContentService.createTextOutput(q.callback + '(' + JSON.stringify(outObj) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(outObj)).setMimeType(ContentService.MimeType.JSON);
    }
    // Support update via GET (useful for JSONP from static hosts)
    if(q.action === 'update' && q.inventory && q.sku){
      const ss = SpreadsheetApp.openById(SHEET_ID);
      const name = INVENTORY_SHEETS[q.inventory] || null;
      if(!name) return ContentService.createTextOutput(JSON.stringify({error:'Inventario inválido'})).setMimeType(ContentService.MimeType.JSON);
      const sh = ss.getSheetByName(name);
      if(!sh) return ContentService.createTextOutput(JSON.stringify({error:'Hoja no encontrada'})).setMimeType(ContentService.MimeType.JSON);
      const data = sh.getDataRange().getValues();
      const headers = data.shift() || [];
      const headerMap = buildHeaderMap(headers);
      const skuIndex = headerMap['sku'];
      if(skuIndex === undefined || skuIndex === -1) return ContentService.createTextOutput(JSON.stringify({error:'Columna sku no encontrada'})).setMimeType(ContentService.MimeType.JSON);
      const rowIndex = data.findIndex(r => String(r[skuIndex]) === String(q.sku));
      if(rowIndex === -1) return ContentService.createTextOutput(JSON.stringify({error:'Fila con sku no encontrada'})).setMimeType(ContentService.MimeType.JSON);
      // Update quantity or other provided fields (case-insensitive)
      const payloadNormalized = {};
      Object.keys(q).forEach(k => { payloadNormalized[String(k).trim().toLowerCase()] = q[k]; });
      const updates = {};
      // canonical keys
      Object.keys(HEADER_ALIASES).forEach(canonical => {
        if(payloadNormalized.hasOwnProperty(canonical) && headerMap[canonical] !== undefined){
          const idx = headerMap[canonical];
          const val = payloadNormalized[canonical];
          sh.getRange(rowIndex + 2, idx + 1).setValue(val);
          updates[canonical] = val;
        }
      });
      // original header names
      headers.forEach((h,i)=>{
        const key = String(h||'').trim().toLowerCase();
        if(payloadNormalized.hasOwnProperty(key)){
          const val = payloadNormalized[key];
          sh.getRange(rowIndex + 2, i + 1).setValue(val);
          updates[h] = val;
        }
      });
      
      // FIX: Return JSONP if callback is provided
      const out = {ok:true,updated:updates};
      
      // Log update via GET
      const user = q.user || 'Desconocido';
      const actionDetails = q.actionDetails || ('Actualización SKU: ' + q.sku);
      logToSheet(user, 'Actualizar (GET)', actionDetails);

      if(q.callback){
        return ContentService.createTextOutput(q.callback + '(' + JSON.stringify(out) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
    }
    // default: return simple info
    const info = {ok:true,info:'Apps Script inventory endpoint'};
    if(q.callback) return ContentService.createTextOutput(q.callback + '(' + JSON.stringify(info) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
    return ContentService.createTextOutput(JSON.stringify(info)).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    const errObj = {error:err.message};
    if(e && e.parameter && e.parameter.callback) return ContentService.createTextOutput(e.parameter.callback + '(' + JSON.stringify(errObj) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
    return ContentService.createTextOutput(JSON.stringify(errObj)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e){
  try{
    // Accept form-encoded and JSON payloads. Merge JSON body into parameters if provided.
    let p = e.parameter || {};
    if(e.postData && e.postData.type && e.postData.type.indexOf('application/json') !== -1){
      const payload = JSON.parse(e.postData.contents || '{}');
      if(payload && payload.syncCategories && payload.categories){
        PropertiesService.getScriptProperties().setProperty('CATEGORIES', JSON.stringify(payload.categories));
        return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
      }
      p = Object.assign({}, p, payload);
    }
    
    // User management routing
    if(p.action === 'login' || p.action === 'register' || p.action === 'getUsers' || p.action === 'approveUser'){
      const result = handleUserAction(p);
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    // accept syncCategories also for form-encoded requests
    if(p.syncCategories && p.categories){
      try{
        const cats = typeof p.categories === 'string' ? JSON.parse(p.categories) : p.categories;
        PropertiesService.getScriptProperties().setProperty('CATEGORIES', JSON.stringify(cats));
        return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
      }catch(err){
        return ContentService.createTextOutput(JSON.stringify({error:'No se pudieron guardar las categorías',detail:err.message})).setMimeType(ContentService.MimeType.JSON);
      }
    }
    const action = p.action || '';
    const inventoryId = p.inventory || p.inv || '1';

    // Open sheet (do NOT create sheets locally). Require sheet to exist.
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetName = INVENTORY_SHEETS[inventoryId] || Object.keys(INVENTORY_SHEETS)[0];
    const sh = ss.getSheetByName(sheetName);
    if(!sh){
      return ContentService.createTextOutput(JSON.stringify({error:'Hoja no encontrada',sheet:sheetName})).setMimeType(ContentService.MimeType.JSON);
    }

    // Handle update action: update one or more columns in the row that matches sku
    if((action === 'update' || action === '' ) && p.sku){
      const data = sh.getDataRange().getValues();
      const headers = data.shift() || [];
      const headerMap = buildHeaderMap(headers);
      const skuIndex = headerMap['sku'];
      if(skuIndex === undefined || skuIndex === -1) return ContentService.createTextOutput(JSON.stringify({error:'Columna sku no encontrada'})).setMimeType(ContentService.MimeType.JSON);
      const rowIndex = data.findIndex(r => String(r[skuIndex]) === String(p.sku));
      if(rowIndex === -1) return ContentService.createTextOutput(JSON.stringify({error:'Fila con sku no encontrada'})).setMimeType(ContentService.MimeType.JSON);

      // Update any provided fields that match header canonical names or original header names.
      const updates = {};
      // handle canonical keys first
      Object.keys(HEADER_ALIASES).forEach(canonical => {
        if(p.hasOwnProperty(canonical) && headerMap[canonical] !== undefined){
          const idx = headerMap[canonical];
          const val = p[canonical];
          sh.getRange(rowIndex + 2, idx + 1).setValue(val);
          updates[canonical] = val;
        }
      });
      // Prepare a case-insensitive map of payload keys for header matching
      const payloadNormalized = {};
      Object.keys(p).forEach(k => { payloadNormalized[String(k).trim().toLowerCase()] = p[k]; });
      // handle original header names provided in payload (case-insensitive)
      headers.forEach((h,i)=>{
        const key = String(h||'').trim().toLowerCase();
        if(payloadNormalized.hasOwnProperty(key)){
          const val = payloadNormalized[key];
          sh.getRange(rowIndex + 2, i + 1).setValue(val);
          updates[h] = val;
        }
      });

      // Log update via POST
      const user = p.user || 'Desconocido';
      const actionDetails = p.actionDetails || ('Actualización SKU: ' + p.sku);
      logToSheet(user, 'Actualizar (POST)', actionDetails);

      return ContentService.createTextOutput(JSON.stringify({ok:true,updated:updates})).setMimeType(ContentService.MimeType.JSON);
    }

    // 'create' action explicitly appends a new row. Otherwise do NOT append.
    if(action === 'create'){
      // Log creation
      const user = p.user || 'Desconocido';
      const actionDetails = p.actionDetails || ('Creación: ' + (p.name || p.nombre || 'Item'));
      logToSheet(user, 'Crear', actionDetails);

      const imageBase64 = p.imageBase64 || p.image || '';
      const imageName = p.imageName || ('img_'+Date.now()+'.png');
      const imageMime = p.imageMime || 'image/png';

      let imageUrl = '';
      if(imageBase64 && imageBase64.length > 100){
        const bytes = Utilities.base64Decode(imageBase64);
        const blob = Utilities.newBlob(bytes, imageMime, imageName);
        const folderId = FOLDER_IDS[inventoryId] || null;
        let folder = null;
        if(folderId){
          try{ folder = DriveApp.getFolderById(folderId); }catch(e){ folder = null; }
        }
        // Do NOT create new Drive folders; if folder not found, skip saving image
        if(folder){
          const file = folder.createFile(blob);
          try{ file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }catch(e){ }
          // Use direct link format for better compatibility
          imageUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
        }
      }

      // --- AUTO-ADD COLUMNS & BUILD ROW ---
      
      // 1. Get current headers (Row 1)
      let sheetData = sh.getDataRange().getValues();
      let headers = [];
      if(sheetData.length > 0) headers = sheetData[0];
      
      // Handle empty sheet case properly: if headers is just [''] or empty, treat as empty
      if(headers.length === 1 && headers[0] === '') headers = [];

      // 2. Prepare payload and notes
      let notesObj = null;
      if(p.notes){
        try{ notesObj = typeof p.notes === 'string' ? JSON.parse(p.notes) : p.notes; }catch(e){ notesObj = null; }
      }

      // Normalize payload keys for case-insensitive matching
      const payloadNormalized = {};
      Object.keys(p).forEach(k => { payloadNormalized[String(k).trim().toLowerCase()] = p[k]; });

      // If notes contained an object, expose its keys at top-level for mapping
      if(notesObj && typeof notesObj === 'object'){
        Object.keys(notesObj).forEach(k => {
          const lk = String(k).trim().toLowerCase();
          if(!payloadNormalized.hasOwnProperty(lk)) payloadNormalized[lk] = notesObj[k];
        });
      }

      // Helper to pick value
      function pick(key){
        const k = String(key||'').trim().toLowerCase();
        if(payloadNormalized.hasOwnProperty(k)) return payloadNormalized[k];
        if(notesObj && notesObj.hasOwnProperty(key)) return notesObj[key];
        if(notesObj && notesObj.hasOwnProperty(k)) return notesObj[k];
        // support some Spanish keys mapping
        const spanishMap = { nombre:'name', codigo:'sku', cantidad:'quantity', imagen:'imageUrl', imagenurl:'imageUrl' };
        const mapped = spanishMap[k];
        if(mapped){
          const mk = mapped.toString().toLowerCase();
          if(payloadNormalized.hasOwnProperty(mk)) return payloadNormalized[mk];
          if(notesObj && notesObj.hasOwnProperty(mapped)) return notesObj[mapped];
          if(notesObj && notesObj.hasOwnProperty(mk)) return notesObj[mk];
        }
        return null;
      }

      // 3. Check for missing columns and add them
      const currentHeaderMap = buildHeaderMap(headers);
      const newHeaders = [];
      
      // Force check specific keys that we know are important
      const keysToCheck = Object.keys(HEADER_ALIASES).concat(Object.keys(payloadNormalized));
      const uniqueKeys = [...new Set(keysToCheck)];

      uniqueKeys.forEach(key => {
         // Skip internal keys
         if(['inventory','category','action','callback','imagebase64','imagename','imagemime','notes'].includes(key)) return;
         
         // Check if this key has a value in payload
         let val = pick(key);
         if(val === null || val === undefined || val === '') return;

         // Check if we already have a column for it (using canonical mapping or direct match)
         let hasColumn = false;
         
         // Check canonical map
         if(HEADER_ALIASES[key] && currentHeaderMap[key] !== undefined) hasColumn = true;
         // Check direct header match
         if(headers.some(h => h.toLowerCase() === key.toLowerCase())) hasColumn = true;
         
         if(!hasColumn){
             // Determine display name
             let displayName = key.charAt(0).toUpperCase() + key.slice(1);
             // Map known keys to nice names
             if(key === 'medida1') displayName = 'Ancho';
             else if(key === 'medida2') displayName = 'Alto';
             else if(key === 'imageurl') displayName = 'Imagen';
             else if(key === 'inventoryid') displayName = 'Inventario ID';
             else if(key === 'grosor') displayName = 'Grosor';
             else if(key === 'color') displayName = 'Color';
             else if(key === 'tipo') displayName = 'Tipo';
             else if(key === 'forma') displayName = 'Forma';
             else if(key === 'linea') displayName = 'Línea';
             else if(key === 'serie') displayName = 'Serie';
             
             if(!newHeaders.includes(displayName)) newHeaders.push(displayName);
         }
      });

      // Ensure basic columns exist if sheet is empty
      if(headers.length === 0){
          if(!newHeaders.includes('Timestamp')) newHeaders.unshift('Timestamp');
          if(!newHeaders.includes('Inventario ID')) newHeaders.unshift('Inventario ID');
      }

      if(newHeaders.length > 0){
          const startCol = headers.length + 1;
          sh.getRange(1, startCol, 1, newHeaders.length).setValues([newHeaders]);
          headers = headers.concat(newHeaders);
      }

      // 4. Rebuild map and create row
      const headerMap = buildHeaderMap(headers);
      const row = headers.map(h => '');
      
      if(headerMap.timestamp !== undefined) row[headerMap.timestamp] = new Date();
      if(headerMap.inventoryId !== undefined) row[headerMap.inventoryId] = inventoryId;

      // fill known canonical fields
      Object.keys(HEADER_ALIASES).forEach(canonical => {
        const idx = headerMap[canonical];
        if(idx !== undefined && idx !== -1){
          const v = pick(canonical);
          if(v !== null && v !== undefined) row[idx] = v;
        }
      });

      // Also fill by raw header names
      headers.forEach((h,i)=>{
        const key = String(h||'').trim().toLowerCase();
        if(payloadNormalized.hasOwnProperty(key)) row[i] = payloadNormalized[key];
      });

      // Ensure imageUrl column receives imageUrl
      if(imageUrl){
        if(headerMap.imageUrl !== undefined) row[headerMap.imageUrl] = imageUrl;
        else {
             // Try to find 'Imagen' or 'Foto' manually if alias map failed
             const imgIdx = headers.findIndex(h => h.toLowerCase().includes('imagen') || h.toLowerCase().includes('foto') || h.toLowerCase().includes('image'));
             if(imgIdx !== -1) row[imgIdx] = imageUrl;
        }
      }

      // If notes column exists and wasn't mapped, store the raw notes JSON
      if(headerMap.notes !== undefined){
        if(p.notes && row[headerMap.notes] === '') row[headerMap.notes] = (typeof p.notes === 'string' ? p.notes : JSON.stringify(p.notes));
        else if(!p.notes && notesObj && row[headerMap.notes] === '') row[headerMap.notes] = JSON.stringify(notesObj);
      }

      sh.appendRow(row);
      // Return diagnostic info so frontend can verify which columns were used
      const resp = { ok:true, imageUrl:imageUrl, row: row, headers: headers, headerMap: headerMap };
      if(p && p.callback){
        return ContentService.createTextOutput(p.callback + '(' + JSON.stringify(resp) + ')').setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      return ContentService.createTextOutput(JSON.stringify(resp)).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({error:'No action taken. To append use action=create, to update use action=update and provide sku.'})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({error:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleUserAction(p){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(USERS_SHEET_NAME);
  if(!sh){
    sh = ss.insertSheet(USERS_SHEET_NAME);
    sh.appendRow(['Username', 'Password', 'Authorized', 'Role', 'Timestamp']); // Headers
  }
  
  const action = p.action;
  const user = (p.user || '').trim();
  const pass = (p.pass || '').trim(); // Should be hashed from client or hashed here. Client sends hash.
  
  if(action === 'login'){
    if(!user || !pass) throw new Error('Faltan credenciales');
    const data = sh.getDataRange().getValues();
    // Skip header
    for(let i=1; i<data.length; i++){
      if(String(data[i][0]) === user){
        if(String(data[i][1]) === pass){
          if(String(data[i][2]) === 'TRUE' || data[i][2] === true){
             return {ok:true, user:user, role:data[i][3]||'user'};
          } else {
             throw new Error('Usuario no autorizado');
          }
        } else {
          throw new Error('Contraseña incorrecta');
        }
      }
    }
    throw new Error('Usuario no encontrado');
  }
  
  if(action === 'register'){
    if(!user || !pass) throw new Error('Faltan datos');
    const data = sh.getDataRange().getValues();
    for(let i=1; i<data.length; i++){
      if(String(data[i][0]) === user) throw new Error('El usuario ya existe');
    }
    // Default unauthorized
    sh.appendRow([user, pass, false, 'user', new Date()]);
    return {ok:true, message:'Solicitud enviada'};
  }
  
  // Admin actions
  if(action === 'getUsers'){
    // Simple auth check (in real app, verify token/session)
    // Here we assume the client has validated admin rights before calling, 
    // but ideally we should check a secret or similar. 
    // For this simple app, we'll just return the list.
    const data = sh.getDataRange().getValues();
    const users = [];
    for(let i=1; i<data.length; i++){
      users.push({user:data[i][0], authorized:data[i][2], role:data[i][3]});
    }
    return {ok:true, users:users};
  }
  
  if(action === 'approveUser'){
    const targetUser = p.targetUser;
    if(!targetUser) throw new Error('Falta targetUser');
    const data = sh.getDataRange().getValues();
    for(let i=1; i<data.length; i++){
      if(String(data[i][0]) === targetUser){
        sh.getRange(i+1, 3).setValue(true);
        return {ok:true};
      }
    }
    throw new Error('Usuario no encontrado');
  }
  
  return {error:'Acción de usuario desconocida'};
}

function logToSheet(user, action, details){
  try{
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sh = ss.getSheetByName(LOG_SHEET_NAME);
    if(!sh){
      sh = ss.insertSheet(LOG_SHEET_NAME);
      sh.appendRow(['Timestamp', 'Usuario', 'Acción', 'Detalles']);
    }
    sh.appendRow([new Date(), user || 'Anónimo', action, details]);
  }catch(e){
    // Ignore logging errors to not break main flow
    console.error('Log error:', e);
  }
}
