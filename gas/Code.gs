// Google Apps Script: Code.gs
// Paste this into your Apps Script project and deploy as Web App (Execute as: Me, Who has access: Anyone, even anonymous)

const SHEET_ID = '1vDvmEj8wdTNV-xEfo2u4rL-0vk4pJWtncq65wKN6PT0'; // <-- update to your spreadsheet ID
const INVENTORY_SHEETS = {
  '1': 'Aluminio',
  '2': 'Herrajes',
  '3': 'Vidrio',
  '4': 'Insumos'
};
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
  name: ['name','nombre'],
  sku: ['sku','codigo','code'],
  quantity: ['quantity','cantidad','qty'],
  notes: ['notes','nota','notas'],
  imageUrl: ['imageurl','image','imagen','url','imageurl']
};

function buildHeaderMap(headers){
  const map = {};
  // defend against invalid input: ensure headers is an array
  if(!Array.isArray(headers)) headers = [];
  const lower = headers.map(h => (h||'').toString().trim().toLowerCase());
  for(const canonical in HEADER_ALIASES){
    const aliases = HEADER_ALIASES[canonical] || [];
    const idx = aliases.reduce((acc, a) => {
      if(acc !== -1) return acc;
      const pos = lower.indexOf((a||'').toString().toLowerCase());
      return pos !== -1 ? pos : acc;
    }, -1);
    if(idx !== -1) map[canonical] = idx;
  }
  // also include raw header name map for any unmatched headers
  lower.forEach((h,i)=>{ if(!Object.values(map).includes(i)) map[h] = i; });
  return map;
}

function doGet(e){
  try{
    const q = e.parameter || {};
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
      return ContentService.createTextOutput(JSON.stringify({ok:true,updated:updates})).setMimeType(ContentService.MimeType.JSON);
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

      return ContentService.createTextOutput(JSON.stringify({ok:true,updated:updates})).setMimeType(ContentService.MimeType.JSON);
    }

    // 'create' action explicitly appends a new row. Otherwise do NOT append.
    if(action === 'create'){
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
          imageUrl = file.getUrl();
        }
      }

      // Build a row aligned with existing headers so individual fields go into separate columns
      const data = sh.getDataRange().getValues();
      const headers = data.shift() || [];
      const headerMap = buildHeaderMap(headers);

      // Try to parse notes JSON if provided
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

      // Helper to pick value from payloadNormalized, canonical key, or notes object
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

      const row = headers.map(h => '');
      // set timestamp and inventoryId if headers exist
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

      // Also fill by raw header names if payload contains matching keys (case-insensitive)
      headers.forEach((h,i)=>{
        const key = String(h||'').trim().toLowerCase();
        if(payloadNormalized.hasOwnProperty(key)) row[i] = payloadNormalized[key];
      });

      // Ensure imageUrl column receives imageUrl
      if(imageUrl){
        if(headerMap.imageUrl !== undefined) row[headerMap.imageUrl] = imageUrl;
        else if(headers.indexOf('imageUrl') !== -1) row[headers.indexOf('imageUrl')] = imageUrl;
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
