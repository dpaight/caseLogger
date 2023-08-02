// Compiled using caselogger 1.0.0 (TypeScript 4.9.5)
var ss = SpreadsheetApp.getActiveSpreadsheet();
// @ts-ignore
var moment = Moment.load();

class Goal {
    constructor(array) {
        this["id"] = array[0];
        this["lvl"] = array[1];
        this["area"] = array[2];
        this["strand"] = array[3];
        this["annual"] = array[4];
        this["standard"] = array[5];
        this["objective1"] = array[6];
        this["objective2"] = array[7];
        this["objective3"] = array[8];
        this["mod"] = array[9];
    }
    list() {
        var item = '<li class="goalList" glId="' +
            this['id'] +
            '">' +
            '["' +
            this["lvl"] +
            '"' +
            ", " +
            '"' +
            this["strand"] +
            '"' +
            ", " +
            '"' +
            this["annual"] +
            '"' +
            ", " +
            '"' +
            this["standard"] +
            '"' +
            ", " +
            '"' +
            this["id"] +
            '"]</li>';
        return item;
    }
    snip() {
        var snip = "[" +
            '"area": "' +
            this["area"] +
            '",' +
            '"gl": "' +
            this["annual"] +
            '",' +
            '"strand": "' +
            this["strand"] +
            '",' +
            '"stnd": "' +
            this["standard"] +
            '"' +
            "]";
        return snip;
    }
    checkboxItem(checked) {
        var me = this["id"];
        if (checked === true) {
            var chkd = "checked";
        }
        else {
            chkd = "";
        }
        console.log("i am %s", me);
        return ("<div class='input-group-prepend'>" +
            "<div  class='input-group-text'>" +
            "<input type='checkbox' class='glChkBx' " +
            chkd +
            " data-obj=" +
            me +
            ">" +
            "<textarea  class='form-control goalList' style='margin-bottom: 5px; height:fit-content; width: 700px;' data-obj=" +
            me +
            " readonly >" +
            "(" +
            this["standard"] +
            ") " +
            this["annual"]);
        ("</textarea>");
        "</div>" + "</div>";
    }
    saved() {
        "<li data-saved='" + this.snip() + "'>" + this["area"] + "</li>";
    }
}
function onLoad() {
    SpreadsheetApp.getUi() // Or DocumentApp or SlidesApp or FormApp.
        .createMenu('Functions')
        .addItem('Open sidebar', 'openSidebar')
        .addItem('Import Aeries XLSX files', 'importXLS_2')
        .addItem('Import new SEIS data', 'getSeisCSV')
        .addItem('get log entries for this student', 'getLogEntries')
        .addSeparator()
        .addItem('New log entries for all selected', 'makeLogEntriesForAllSelected')
        .addToUi();
    setUpAttendance();
    checkFolderIdProperties();
}
function checkFolderIdProperties() {

    var scriptProp = PropertiesService.getScriptProperties();
    scriptProp.deleteAllProperties();

    if (!scriptProp.getProperty("csvSource")) {
        var folders = DriveApp.getFoldersByName("source csv files");
        if (!folders.hasNext()) {
            // alert user
            Logger.log('no folders returned for csv source');
/*  */            SpreadsheetApp.getUi().alert("Could not locate a folder in G-Drive named \"source csv files\"");
        } else {
            while (folders.hasNext()) {
                var folder = folders.next();
                scriptProp.setProperty("csvSource", folder.getId());
                Logger.log('excelSource now set to %s', scriptProp.getProperty('csvSource'));
                break;
            }
        }
    } else {
        Logger.log('csvSource already set to %s', scriptProp.getProperty('csvSource'));
    }
    if (!scriptProp.getProperty('excelSource')) {
        var folders = DriveApp.getFoldersByName("source excel files");
        if (!folders.hasNext()) {
            // alert user
            Logger.log('no folders returned for excel source');
        } else {
            while (folders.hasNext()) {
                var folder = folders.next();
                scriptProp.setProperty("excelSource", folder.getId());
                Logger.log('excelSource now set to %s', scriptProp.getProperty('excelSource'));
                break;
            }
        }
    } else {
        Logger.log('excelSource already set to %s', scriptProp.getProperty('csvSource'));
    }

}

function openSidebar(seisId) {
    var html = HtmlService.createTemplateFromFile('sidebar')
        .evaluate();
    SpreadsheetApp.getUi().showModelessDialog(html, "the title");
}
function getCurrentRecord() {
    Logger.log('get current record ran');
    var cell = ss.getCurrentCell();
    var row = cell.getRow();
    var id = ss.getActiveSheet().getRange(row, 1, 1, 1).getValue();
    var dataSheet = ss.getSheetByName("contactInfo");
    var dataRange = dataSheet.getRange(1, 1, dataSheet.getLastRow(), dataSheet.getLastColumn());
    var data = dataRange.getValues();
    Logger.log(JSON.stringify(data));

    for (let i = 0; i < data.length; i++) {
        const el = data[i];
        if (el[0] === id) {
            Logger.log('returning a record from row %s', row);
            return el;
        }
    }
}
function getLogEntries(row) {
    if (row !== undefined) {
        var id = ss.getSheetByName('checklist').getRange(row, 1, 1, 1).getValue();
    }
    else {
        var sheet = ss.getSheetByName('checklist');
        var headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues().flat();
        var cell = ss.getCurrentCell();
        row = cell.getRow();
        id = ss.getActiveSheet().getRange(row, 1, 1, 1).getValue();
        var name = ss.getActiveSheet().getRange(row, headings.indexOf('Last Name, First Name') + 1, 1, 1).getValue();

    }
    var dest = ss.getRangeByName("TargetID");
    dest.setValue(id);
    // var selectRange = ss.getRangeByName('Select');
    // selectRange.setBackground('#ffffff');
    // ss.getSheetByName('checklist').getRange(row, headings.indexOf('Select') + 1, 1, 1).setBackground('#00FFFF');
    var title = 'log entries for \n\n' + name;
    var titleRange = ss.getRangeByName('title');
    titleRange.setValue(title);
    titleRange.activate();
}
function onEditActions(e) {
    var sheet = ss.getActiveSheet();
    var headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues().flat();
    // checking for goal filter action
    if (sheet.getName() === 'goalFilter' && e.range.rowStart === 1 && e.range.columnStart < 3) {
        // pass to goal snippet builder
        var last = sheet.getRange(3, 7, 50, 1).getValues().filter(String).length;
        var goalsSet = sheet.getRange(3, 7, last, 1).getValues();
        var allGoals = ss.getSheetByName('goals').getDataRange().getValues();
        var snippets = [];
        for (let i = 0; i < goalsSet.length; i++) {
            const el = goalsSet[i];
            const goalId = el[0];
            for (let j = 0; j < allGoals.length; j++) {
                const glEl = allGoals[j];
                if (goalId === glEl[0]) {
                    snippets.push([new Goal(glEl).snip()]);
                }
            }
        }
        var snipDest = sheet.getRange(3, 8, snippets.length, 1);
        var snipCol = sheet.getRange(3, 8, 50, 1);
        snipCol.clear();
        snipDest.setValues(snippets);
        return;
    }
    // end of goal filter action
    // now checking for log entry action(s)
    if (!e.value || e.range.columnStart !== headings.indexOf("Add as Log Entry") + 1) {
        Logger.log('invalid location or entry');
        return;
    }
    else {
        Logger.log(JSON.stringify(e));
        // the event object: {"authMode":"FULL","oldValue":"oh timmy!","range":{"columnEnd":11,"columnStart":11,"rowEnd":22,"rowStart":22},"source":{},"triggerUid":"16780406","user":{"email":"paight@gmail.com","nickname":"paight"},"value":"oh timmy! timmy!"}
        var row = e.range.rowStart;
        var seisId = ss.getActiveSheet().getRange(row, 1, 1, 1).getValue();
        var contents = e.value;
        var dataRow = createLogEntryRecord(seisId, contents, 0);
        sheet = ss.getSheetByName('logRespMerged');
        var last = sheet.getRange('A1:A').getValues().filter(String).length;
        var dest = sheet.getRange(last + 1, 1, 1, dataRow.length);
        try {
            dest.setValues([dataRow]);
            var newNone = dataRow[5];
            var dest2 = ss.getRangeByName("TargetID");
            dest2.setValue("");
            SpreadsheetApp.flush();
            dest2.setValue(newNone);
        }
        catch (error) {
            SpreadsheetApp.getUi().alert("that didn't work" + error);
            return;
        }
        var originCell = ss.getActiveSheet().getRange(e.range.rowStart, e.range.columnStart, 1, 1);
        originCell.clear();
    }
}
function makeLogEntriesForAllSelected() {
    var contents = SpreadsheetApp.getUi()
        .prompt("Enter the text of the log entries for all selected records: ")
        .getResponseText();
    var students = ss.getRangeByName('stuDataChecklist').getValues();
    var array = []; // an array of new log entries
    for (let i = 0; i < students.length; i++) {
        const el = students[i];
        if (el[13] === true) {
            var seisId = el[0];
            var entry = createLogEntryRecord(seisId, contents, i);
            array.push(entry);
        }
    }
    Logger.log('this is the array: %s', JSON.stringify(array));
    if (array.length > 0) {
        var sheet = ss.getSheetByName('logRespMerged');
        var last = sheet.getRange('A1:A').getValues().filter(String).length;
        var dest = sheet.getRange(last + 1, 1, array.length, array[0].length);
        dest.setValues(array);
    }
}
function createLogEntryRecord(seisId, contents, i) {
    // here, i is the number value passed; it will be 0 for single entries, but for batch entries, it will be the value of i in the for loop; that way the ids can be incremented correctly -- just add i
    var ids = ss.getSheetByName("logRespMerged").getRange("E2:E").getValues().flat().sort((a, b) => b - a);
    var last = ss.getSheetByName("logRespMerged").getRange("E1:E").getValues().filter(String).length;
    var newId = ids[0] + 1 + i;
    var logDate = new Date();
    var dataRow = [logDate.toLocaleString(), "dpaight@hemetusd.org", "", contents, newId, seisId];
    Logger.log(JSON.stringify(dataRow));
    return dataRow;
}
function getGoal(gId) {
    if (gId === void 0) {
        gId = 47;
    }
    var sheet = ss.getSheetByName("goals");
    var last = sheet.getRange("A1:A").getValues().filter(String).length;
    var range = sheet.getRange(2, 1, last - 1, sheet.getLastColumn());
    var values = range.getValues();
    for (var i = 0; i < values.length; i++) {
        var el = values[i];
        if (el[0] == gId) {
            var id = el[0], grdLvl = el[1], area = el[2], strand = el[3], annual = el[4], standard = el[5], objctv1 = el[6], objctv2 = el[7], objctv3 = el[8];
            var goal = new Goal([
                id,
                grdLvl,
                area,
                strand,
                annual,
                standard,
                objctv1,
                objctv2,
                objctv3
            ]);
        }
        // return false;
    }
    Logger.log("the goal object is %s", JSON.stringify(goal));
    return goal;
}
function sortStuDataRangeByCurrentColumn() {
    var sheet = ss.getSheetByName('checklist');
    var cell = sheet.getCurrentCell();
    var col = cell.getColumn() - 1;
    // Logger.log('the sort column is %s', col);
    var data = ss.getRangeByName('stuDataChecklist').getValues();
    var preSortedIds = getFlatIds(data);
    var records = preSortedIds.length;

    // sort the data asc
    data.sort(function (a, b) {
        if (a[col] < b[col]) {
            return -1
        } else if (a[col] > b[col]) {
            return 1;
        } else {
            return 0;
        }
    });
    // extract the id field
    var postSortedIds = getFlatIds(data);
    var values = [];
    var ids = compare(preSortedIds, postSortedIds);

    function compare(preSortedIds, postSortedIds) {
        // compare the order of the id fields pre- and post-sort
        // Logger.log('pre-sorted are %s; \npostsorted are %s', JSON.stringify(preSortedIds), JSON.stringify(postSortedIds));
        for (let i = 0; i < preSortedIds.length; i++) {
            const el = preSortedIds[i];
            if (postSortedIds.indexOf(el) !== i) {
                // the two lists were different; use the ascending sort
                var range = ss.getRangeByName('stuDataChecklist');
                range.sort({ column: col + 1, ascending: true });
                break;
            }
            else if (i >= preSortedIds.length - 1) {
                // records were in the same order; do a desc sort
                range = sheet.getRange(2, 1, records, data[0].length);
                range.sort({ column: col + 1, ascending: false });
            }
        }
    }

    function getFlatIds(array) {
        var ids = [];
        for (let i = 0; i < array.length; i++) {
            const el = array[i];
            // Logger.log('el is %s', el[0]);
            if (el[0] !== "" && el[0] !== null) {
                // Logger.log('el (%s) accepted', el[0]);
                ids.push(el[0]);
            }
        }
        return ids;
    }
}

function sortStuDataRangeByGrade() {
    var range = ss.getRangeByName('stuDataChecklist');
    range.sort({ column: 4, ascending: true });
}
function sortStuDataRangeByName() {
    var range = ss.getRangeByName('stuDataChecklist');
    range.sort({ column: 2, ascending: true });
}
function sortStuDataRangeByAnnual() {
    var range = ss.getRangeByName('stuDataChecklist');
    range.sort({ column: 5, ascending: true });
}
function sortStuDataRangeByTri() {
    var range = ss.getRangeByName('stuDataChecklist');
    range.sort({ column: 6, ascending: true });
}
function importXLS_2() {
    if (PropertiesService.getScriptProperties().getProperty("excelSource") === null) {
        checkFolderIdProperties();
    }

    var folderID = PropertiesService.getScriptProperties().getProperty("excelSource");
    var files = DriveApp.getFolderById(folderID).getFiles();
    var hits = 0;
    while (files.hasNext()) {
        var xFile = files.next();
        var name = xFile.getName();
        if (name.indexOf("xlsx") > -1) {
            hits++;
            var ID = xFile.getId();
            var xBlob = xFile.getBlob();
            var newFile = {
                title: (name + "_converted_" + new Date().toLocaleDateString()).toString().replace(/\.xlsx/g, ""),
                parents: [{ id: folderID }]
            };
            var file = Drive.Files.insert(newFile, xBlob, {
                convert: true
            });
            var fileId = file.id;
            // Drive.Files.remove(ID); // Added // If this line is run, the original XLSX file is removed. So please be careful this.
            var newConvFile = SpreadsheetApp.openById(fileId);
            var newConvValues = newConvFile.getDataRange().getValues();
            var destSheet = ss.getSheetByName('allPupilsFromAeries');
            if (hits === 1) {
                destSheet.clear();
                var destRange = destSheet.getRange(1, 1, newConvValues.length, newConvValues[0].length);
                destRange.setValues(newConvValues);
                var last = newConvValues.length;
            }
            else {
                newConvValues.shift();
                var destRange = destSheet.getRange(last + 1, 1, newConvValues.length, newConvValues[0].length);
                destRange.setValues(newConvValues);
            }
        }
        DriveApp.getFileById(fileId).setTrashed(true);
    }
    var headersAndFormulas = [
        [
            '=ArrayFormula(iferror(vlookup($M1:$M, teacherCodes!A1:E, 5,false))',
            '=ArrayFormula(iferror(vlookup($M1:$M,{teacherCodes!$B$1:$I34 }, 8,false),if(row($M$1:$M) = 1,"teachName","")))	',
            '=ArrayFormula(if(row($Z$1:$Z) <> 1, if(isBlank($A$1:$A),,if(($M$1:$M = 21) + ($M$1:$M = 100) + ($M$1:$M = 105) + sum($S$1:$S = "X") > 0, 1, 0)),"sdc||rsp"))	',
            '=ArrayFormula(if(row(A1:A)=1,"nmjdob",regexreplace(if(isblank(A1:A),, REGEXREPLACE(C1:C & D1:D, "[ \'-]", "") & right(year(G1:G),2) & days("12/31/"&(year(G1:G)-1), G1:G)),"-","")))',
            '=ArrayFormula(if(isblank(id),, regexreplace(C1:C & "_" & firstName & "_" & A1:A, "[ \'-]", "")))',
            '=ArrayFormula(if(isblank(id),, REGEXREPLACE(C1:C & "_" & firstName & "_dob_" & dob, "[ \'-]", "")))',
            '=ArrayFormula(if(isblank(id),, REGEXREPLACE(C1:C & "_" & firstName, "[ \'-]", "")))',
            '=ArrayFormula(if(isblank(id),, REGEXREPLACE(D1:D & "_" & lastName, "[ \'-]", "")))',
        ],
    ];
    var formulaRng = destSheet.getRange(1, newConvValues[0].length + 1, 1, headersAndFormulas[0].length);
    formulaRng.setFormulas(headersAndFormulas);
}
function parseCSV(fName) {
    if (PropertiesService.getScriptProperties().getProperty("csvSource") === null) {
        checkFolderIdProperties();
    }
    var folderId = PropertiesService.getScriptProperties().getProperty("csvSource");
    //  1DLxHwR7QlDloES0RCAkuN2bBawdAaAp9
    // var folderId = "1DLxHwR7QlDloES0RCAkuN2bBawdAaAp9";
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var fileIds = [];
    // looking for .csv file
    var found = false;
    while (files.hasNext() && found === false) {
        var file = files.next();
        var fileName = file.getName();
        var status; // '1' if parse function is successful
        var re = /(fName)/;
        if (fileName.toString() === fName.toString()) {
            found = true;
            var csvFile = file.getBlob().getDataAsString();
            fileIds.push(file.getId());
            var data = Utilities.parseCsv(csvFile);
            // var iObj = getIndicesByHeading(data[0]);
            return data;
        }
    }
}
function getSeisCSV() {
    var data = parseCSV('roster_seis.csv');
    var sheet = ss.getSheetByName('roster_seis');
    sheet.clear();
    var dest = ss.getSheetByName('roster_seis').getRange(1, 1, data.length, data[0].length);
    dest.setValues(data);
    var nmjdobFormulaCell = sheet.getRange(1, data[0].length + 1, 1, 1);
    var formulas =
        [
            '=ArrayFormula(if(row(A1:A)=1,"nmjdob",regexreplace(if(isblank(A1:A),, REGEXREPLACE(B1:B & C1:C, "[ \'-]", "") & right(year(TEXT(D1:D, "0")),2) & days("12/31/"&(year(TEXT(D1:D, "0"))-1), TEXT(D1:D, "0"))),"-","")))'
        ]

    nmjdobFormulaCell.setFormula(formulas[0]);
    var newIds = ss.getSheetByName('roster_seis').getRange(2, 1, 40, 1).getValues().flat();
    var oldIds = ss.getSheetByName('checklist').getRange(2, 1, 40, 1).getDisplayValues().flat();
    // replace ids in checklist
    var array = [];
    data.shift();
    for (let i = 0; i < data.length; i++) {
        if (oldIds.indexOf(data[i][0]) === -1) {
            array.push([data[i][0]]);
        }
    }
    if (array.length > 0) {
        var last = ss.getSheetByName('checklist').getRange('A1:A').getValues().filter(String).length;
        var newIdRange = ss.getSheetByName('checklist').getRange(last + 1, 1, array.length, 1);
        newIdRange.setValues(array);
    }
    getServicesCSV();
}
function getServicesCSV() {
    var data = parseCSV('services.csv');
    var sheet = ss.getSheetByName('services');
    sheet.clear();
    var dest = ss.getSheetByName('services').getRange(1, 1, data.length, data[0].length);
    dest.setValues(data);
}
function multipleLogEntries() {
    var entry = SpreadsheetApp.getUi()
        .prompt("Log entry for all selected records: ")
        .getResponseText();
    var students = ss.getRangeByName('stuDataChecklist');
}
function scheduleSetup() {
    var sheet, range, values, theDates, theDays;
    var offSet = 0;
    sheet = ss.getSheetByName("attnd");
    range = sheet.getDataRange();
    values = range.getDisplayValues();
    var headings = values.shift();
    var today = moment().format("MM-DD-YYYY");
    if (headings.indexOf(today) === -1) {
        today = moment().day(0);
    }
    var col = headings.indexOf(today) + 1;
    var cell = sheet.getRange(3, col, 1, 1);
    cell.activate();
    range = sheet.getRange(3, 9, 20, 180);
    range.setBackground("");
    range = sheet.getRange(3, col, 20, 1);
    range.setBackground("#ffe599");
    Logger.log('%s', moment().day());
    var grpRng = sheet.getRange(1, 12, 30, (col - (11 + (moment().day()))));
    // grpRng.group
    sheet.getColumnGroup(12, 1).remove();
    var dateGrp = grpRng.shiftColumnGroupDepth(1);
    // dateGrp.shiftColumnGroupDepth(-1);
    dateGrp.collapseGroups();
}
function getServices(seisId) {
    var sheet = ss.getSheetByName('services');
    var last = sheet.getRange('A1:A').getValues().filter(String).length;
    var range = sheet.getRange(2, 1, last, 35);
    var values = range.getValues();
    var services = [];
    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        if (el[0] === seisId && el[6] === "No") {
            services.push(el[0], el[4], el[16], el[17]);
        }
    }
    return services;
}
function getSeisContactInfo() {
    var sheet = ss.getSheetByName('roster_seis');
    var last = sheet.getRange('A1:A').getValues().filter(String).length;
    var range = sheet.getRange(1, 1, last, sheet.getLastColumn());
    var values = range.getDisplayValues();
    var headingsR = values.shift().flat();

    var sheetA = ss.getSheetByName('allPupilsFromAeries');
    var lastA = sheetA.getRange('A1:A').getValues().filter(String).length;
    var rangeA = sheetA.getRange(1, 1, lastA, sheetA.getLastColumn());
    var valuesA = rangeA.getDisplayValues();
    var headingsA = valuesA.shift().flat();

    var nmjdobRIndex = headingsR.indexOf('nmjdob');
    var nmjdobAIndex = headingsA.indexOf('nmjdob');


    var contactData = [];
    var row = [];
    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        var nmjdobR = el[nmjdobRIndex];
        row.push(el[0], el[24], el[3], el[12], el[24], el[13]);

        for (let j = 0; j < valuesA.length; j++) {
            const elA = valuesA[j];
            var nmjdobA = elA[nmjdobAIndex];
            if (nmjdobR === nmjdobA) {
                if (nmjdobR === nmjdobA) {
                    row.push(elA[12]);
                    var teacherNmEmail = getTeacherInfoFromCode(elA[12]);
                    row.push(teacherNmEmail[0]);
                    row.push(teacherNmEmail[1]);
                }
            }
        }
        contactData.push(row);
        row = [];
    }
    var dest = ss.getSheetByName('contactInfo');
    var destRange = dest.getRange(1, 1, contactData.length, contactData[0].length);
    destRange.setValues(contactData);
}
function getTeacherInfoFromCode(code) {
    var sheet = ss.getSheetByName('teacherCodes');
    var last = sheet.getRange('A1:A').getValues().filter(String).length;
    var range = sheet.getRange(2, 1, last, 6);
    var values = range.getValues();

    for (let i = 0; i < values.length; i++) {
        const el = values[i];
        if (code.toString() === el[0].toString()) {
            return [el[1], el[4]];
        }
        if (i === values.length - 1) {
            return ["no data", "no data"];
        }
    }
}
function checkUncheckAll() {
    var sheet = ss.getSheetByName('checklist');
    var headings = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues().flat();
    var last = sheet.getRange(1, 1, 50, 1).getValues().filter(String).length;
    var range = sheet.getRange(2, headings.indexOf("Select") + 1, last - 1, 1);
    var values = range.getValues().flat();
    if (values[0] === true) {

        var newVal = false;
    } else {
        newVal = true;
    }
    var newValues = [];
    for (let i = 0; i < values.length; i++) {
        newValues.push([newVal]);
    }
    range.setValues(newValues);
}
function setUpAttendance() {
    // go to the place in the spreadsheet where you are going to record attendance for today. 
    // also include a week before

    var sheet, range, values, theDates, theDays;
    var offSet = 0;

    var todayWkDy = (moment().weekday() === 0 || moment().weekday() === 6) ?
        moment().weekday(-5) :
        moment().weekday();

    var todayDt = (moment().weekday() === 0 || moment().weekday() === 6) ?
        moment().subtract(2, 'd').format('MM-DD-YYYY') :
        moment().format('MM-DD-YYYY');

    sheet = ss.getSheetByName("attnd");
    range = sheet.getDataRange();
    // reset all cells to white background
    range.setBackground('#ffffff');
    values = range.getDisplayValues();
    // everything is a string (dates, too)
    var dateRow = values.shift();
    // throw away row 2
    values.shift();

    // highlight the current day
    var hiliteRange = sheet.getRange(1, dateRow.indexOf(todayDt) + 1, 30, 1);
    hiliteRange.setBackground('#fff2cc');
    var lastMonday = moment(todayDt, "MM-DD-YYYY").subtract(7, 'd').weekday(1).format("MM-DD-YYYY");
    var lstMonCol = dateRow.indexOf(lastMonday) + 1;
    var dayOne = dateRow.indexOf("startOfDates") + 1;


    var colGroups = sheet.getColumnGroup(dayOne, 1);
    try {
        colGroups.remove();
    } catch (error) {
        Logger.log('failed to remove column group(s): %s', error);
    }

    var grpRng = sheet.getRange(1, dayOne, 50, lstMonCol - dayOne);

    var dateGrp = grpRng.shiftColumnGroupDepth(1);
    dateGrp.collapseGroups();
    sheet.getRange(3, dateRow.indexOf(todayDt) + 1, 1, 1).activate();
}


function countAttendance(arrayHere, arrayAssigned, datesRange) {
    if (ss.getActiveSheet().getName() !== 'attndSmry') {return};
    
    var sheet, rangeHere, attended, assigned, rangeAssigned, datesRangeValues, countDay = 0, countHere = 0;
    sheet = ss.getSheetByName('attnd');
    Logger.log('aryHere, datesRange, and aryAssgnd are \n%s, \n%s and \n%s', JSON.stringify(arrayHere), JSON.stringify(datesRange), JSON.stringify(arrayAssigned));

    arrayHere = arrayHere.shift();
    arrayAssigned = arrayAssigned.shift();
    datesRange = datesRange.shift();
    Logger.log('aryHere, datesRange, and aryAssgnd are \n%s, \n%s and \n%s', JSON.stringify(arrayHere), JSON.stringify(datesRange), JSON.stringify(arrayAssigned));

    for (let i = 0; i < datesRange.length; i++) {
        const a = moment(datesRange[i], 'MM-DD-YYYY').weekday();
        Logger.log('the date is %s\n day of the week is %s', datesRange[i], a);
        if (arrayAssigned[a - 1] === true && (arrayHere[i] >= 0 || arrayHere[i] === "")) {
            countDay++;
        }
        Logger.log('the value of arrayAssigned is %s', JSON.stringify(arrayAssigned));
        if (a === 1 && arrayAssigned[a - 1] === true && arrayHere[i] === 1) {
            countHere++;
        } else if (a === 2 && arrayAssigned[a - 1] === true && arrayHere[i] === 1) {
            countHere++;
        } else if (a === 3 && arrayAssigned[a - 1] === true && arrayHere[i] === 1) {
            countHere++;
        } else if (a === 4 && arrayAssigned[a - 1] === true && arrayHere[i] === 1) {
            countHere++;
        } else if (a === 5 && arrayAssigned[a - 1] === true && arrayHere[i] === 1) {
            countHere++;
        }
    }
    return [[countDay, countHere]];
}

//# sourceMappingURL=module.js.map