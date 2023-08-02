class Student {
    constructor(array) {
        this["id"] = array[0]; // passed
        this["grade"] = array[1]; // seis
        this["dateOfBirth"] = array[2]; // seis
        this["parentName"] = array[3]; // seis
        this["parentEmail"] = array[4]; // seis 
        this["parentPhone"] = array[5]; // seis
        this["teacherName"] = array[6]; // aeries + lookup
        this["teacherEmail"] = array[7]; // aeries + lookup
        this["services"] = array[8]; // services sheet
        this["goalAreas"] = array[9]; // 
        this["schedulingNotes"] = array[10] // 
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
