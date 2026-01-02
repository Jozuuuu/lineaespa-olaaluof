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
      const rows = data.map(r => {
        const obj = {};
        headers.forEach((h,i)=> obj[h] = r[i]);
        return obj;
      });
      return ContentService.createTextOutput(JSON.stringify({ok:true,rows:rows})).setMimeType(ContentService.MimeType.JSON);
    }
    // default: return simple info
    return ContentService.createTextOutput(JSON.stringify({ok:true,info:'Apps Script inventory endpoint'})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({error:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e){
  try{
    // If frontend sent syncCategories as JSON body, handle it (some frontends used JSON)
    if(e.postData && e.postData.type && e.postData.type.indexOf('application/json') !== -1){
      const payload = JSON.parse(e.postData.contents || '{}');
      if(payload && payload.syncCategories && payload.categories){
        PropertiesService.getScriptProperties().setProperty('CATEGORIES', JSON.stringify(payload.categories));
        return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // For application/x-www-form-urlencoded (preferred by frontend): values are in e.parameter
    const p = e.parameter || {};
    // Accept either p.imageBase64 or p.image (if someone posts different name)
    const inventoryId = p.inventory || p.inv || '1';
    const category = p.category || '';
    const name = p.name || '';
    const sku = p.sku || '';
    const quantity = p.quantity || '';
    const notes = p.notes || '';
    const imageBase64 = p.imageBase64 || p.image || '';
    const imageName = p.imageName || ('img_'+Date.now()+'.png');
    const imageMime = p.imageMime || 'image/png';

    let imageUrl = '';
    if(imageBase64 && imageBase64.length > 100){
      // decode base64 and save to Drive
      const bytes = Utilities.base64Decode(imageBase64);
      const blob = Utilities.newBlob(bytes, imageMime, imageName);
      const folderId = FOLDER_IDS[inventoryId] || null;
      let folder = null;
      if(folderId){
        try{ folder = DriveApp.getFolderById(folderId); }catch(e){ folder = null; }
      }
      if(!folder){
        // fallback: create/get root folder named 'inventario_images' under your account
        const rootName = 'inventario_images';
        const folders = DriveApp.getFoldersByName(rootName);
        if(folders.hasNext()) folder = folders.next(); else folder = DriveApp.createFolder(rootName);
      }
      const file = folder.createFile(blob);
      // make accessible by link (optional)
      try{ file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); }catch(e){ /* ignore permission errors */ }
      imageUrl = file.getUrl();
    }

    // Append row to Spreadsheet
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheetName = INVENTORY_SHEETS[inventoryId] || Object.keys(INVENTORY_SHEETS)[0];
    let sh = ss.getSheetByName(sheetName);
    if(!sh){ // create sheet with header
      sh = ss.insertSheet(sheetName);
      sh.appendRow(['timestamp','inventoryId','category','name','sku','quantity','notes','imageUrl']);
    }
    const ts = new Date();
    sh.appendRow([ts, inventoryId, category, name, sku, quantity, notes, imageUrl]);

    return ContentService.createTextOutput(JSON.stringify({ok:true, imageUrl:imageUrl})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({error:err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
