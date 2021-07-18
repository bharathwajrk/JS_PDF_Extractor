/**
 * Appian PDF Extractor
 * Bharathwaj RK
 * <mailto:bharathwajk@vuram.com>
 * Dynamically Create Field Labels and Input fields based on given values.
*/
function createLeftPaneElement(fieldValues, pdfUrl, isEditForm){
    var flexContainer = document.getElementById("flex-container");
    var leftPaneDiv = document.getElementById("pdf-reader-left-pane");
    var errorDiv = document.getElementById("pdf-error-message");
    let tempDetails = window['tempDetails'];
    var pdfDetails = {}, inpKeyPressAttr = "return false;";

    if(fieldValues !== undefined && fieldValues !== null && fieldValues.length > 0){
        errorDiv.style.display = 'none';
        flexContainer.style.display = 'flex';
        if(isEditForm === true){
            // inpKeyPressAttr = "";
            inpKeyPressAttr = "editInpValue(this);";
        }
        if(leftPaneDiv.classList.contains("left-pane-border")){
            leftPaneDiv.classList.remove("left-pane-border");
        }
        leftPaneDiv.innerHTML = '';

        fieldValues.map(function (element, index) {
            var linebreak = document.createElement("br");
            var subDiv = document.createElement("div");
            subDiv.setAttribute("index", index);
            subDiv.setAttribute("class", "sub-div");

            var label = document.createElement("label");
            label.setAttribute("index", index);
            label.setAttribute("class", "fieldValue-label");
            label.innerHTML = element;
            subDiv.appendChild(label);

            var inpTag = document.createElement("input");
            inpTag.setAttribute("index", index);
            inpTag.setAttribute("type", "text");
            inpTag.setAttribute("txt-label", element);
            inpTag.setAttribute("class", "fieldValue-inp");
            inpTag.setAttribute("onclick", "selectedInputElem=this;searchContent(this);");
            inpTag.setAttribute("onkeypress", inpKeyPressAttr);
            inpTag.setAttribute("value", "");
            subDiv.appendChild(inpTag);
            subDiv.appendChild(linebreak);

            leftPaneDiv.appendChild(subDiv);
            leftPaneDiv.appendChild(linebreak);
            pdfDetails[element] = "";

            let det = {};
            det.value = "";
            det.domRect = null;
            det.pageNumber = null;

            tempDetails[element] = det;
        });

        if(pdfUrl !== undefined && pdfUrl !== null && pdfUrl !== ""){
            leftPaneDiv.classList.add("left-pane-border");
            document.getElementById("output-value-json").innerHTML = JSON.stringify(pdfDetails);
            pdfViewerSelection(pdfUrl);
        }
        else{
            errorDiv.innerHTML = "PDF URL not available."
            errorDiv.style.display = 'inline-block';
            if(leftPaneDiv.classList.contains("left-pane-border")){
                leftPaneDiv.classList.remove("left-pane-border");
            }
            leftPaneDiv.style.borderRight = 'none';
            flexContainer.style.display = 'none';
            return null;
        }
        return pdfDetails;
    }
    else{

        errorDiv.innerHTML = "No Field Lables available."
        errorDiv.style.display = 'inline-block';
        if(leftPaneDiv.classList.contains("left-pane-border")){
            leftPaneDiv.classList.remove("left-pane-border");
        }
        flexContainer.style.display = 'none';
        return null;
    }
}

/**
 * Retrieve the value in the Input field and highlight in PDF section.
*/
function searchContent(elem){
    let curPage = window['pageNo'];
    var textContent = elem.getAttribute("value");
    let tempDet = window['tempDetails'];
    let curDet = elem.getAttribute("txt-label");
    let CurrentElement = tempDet[curDet];

    if(textContent !== null && textContent !== undefined && textContent !== ""){
        if(curPage === CurrentElement.pageNumber){
            if(window['selElem']){
                $(window['selElem']).removeHighlight();
            }
            window['xCoord'] = CurrentElement.domRect["x"];
            window['yCoord'] = CurrentElement.domRect["y"];
            window['selElem'] = document.elementFromPoint(CurrentElement.domRect["x"], CurrentElement.domRect["y"]);
            $(window['selElem']).highlight(textContent);
        }
    }
}

function editInpValue(el){
    let tempDetails = window['tempDetails'];
    let pdfDetails = window['pdfValues'];
    let curDetls = el.getAttribute("txt-label");
    let newVal = el.value ? el.value.trim(): "";

    tempDetails[curDetls].value = newVal;
    pdfDetails[curDetls] = newVal;

    //save values selected to output variable pdfValues
    window['pdfValues'] = pdfDetails;
    document.getElementById("output-value-json").innerHTML = JSON.stringify(pdfDetails);
    // Appian.Component.saveValue('pdfValues', pdfDetails);
}

function executePDFExtract(){
  var defaultFL = '["EmployeeID", "EmployeeSSN", "EmployeeName", "StateWages"]';
  var defaultUrl = "https://pdfjs-express.s3-us-west-2.amazonaws.com/docs/choosing-a-pdf-viewer.pdf";
  var fieldLabels = [], pdfUrl, backgroundColor, isEditForm;
  fieldLabelsStr = document.getElementById("fieldLabels") && document.getElementById("fieldLabels").value ? document.getElementById("fieldLabels").value.trim() : defaultFL;
  pdfUrl = document.getElementById("pdfUrl") && document.getElementById("pdfUrl").value ? document.getElementById("pdfUrl").value.trim() : defaultUrl;
  backgroundColor = document.getElementById("backgroundColor") && document.getElementById("backgroundColor").value ? document.getElementById("backgroundColor").value.trim() : '#e8e8e8';
  isEditForm = document.getElementById("isEditForm") && document.getElementById("isEditForm").value ? document.getElementById("isEditForm").value.trim() : false;

  try {
    fieldLabels = JSON.parse(fieldLabelsStr);
  } catch (e) {
    fieldLabels = [];
  }

  document.body.style.background = backgroundColor;
  pdfValues = createLeftPaneElement(fieldLabels, pdfUrl, isEditForm, tempDetails);
}

function displayInputFields(isShow){
  if(isShow === true){
    document.getElementById("pdf-extract-inputs-fieldset").style.display = "inline-block";
    document.getElementById("hideInput").style.display = "inline-block";
    document.getElementById("showInput").style.display = "none";
  }
  else{
    document.getElementById("pdf-extract-inputs-fieldset").style.display = "none";
    document.getElementById("showInput").style.display = "inline-block";
    document.getElementById("hideInput").style.display = "none";
  }
}

function copyOutputToClipboard(){
  let copyText = document.getElementById("output-value-json");
  let range = document.createRange();
  range.selectNode(document.getElementById("output-value-json"));
  window.getSelection().removeAllRanges(); // clear current selection
  window.getSelection().addRange(range); // to select text
  document.execCommand("copy");
}
