/**
 * Appian PDF Extractor
 * Bharathwaj RK
 * <mailto:bharathwajk@vuram.com>
 * Load PDF JS.
*/
function pdfViewerSelection(url){
    // Loaded via <script> tag, create shortcut to access PDF.js exports.
    var pdfjsLib = window['pdfjs-dist/build/pdf'];

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@latest/build/pdf.worker.min.js';

    var pdfDoc = null,
        pageNum = 1,
        pageRendering = false,
        pageNumPending = null,
        //scale = 0.8,
        scale = 1,
        canvas = document.getElementById('pdf-viewer-canvas'),
        ctx = canvas.getContext('2d'),
        leftPaneDiv = document.getElementById("pdf-reader-left-pane");

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    function renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport({scale: scale});
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        leftPaneDiv.style.height = canvas.height+'px';
        leftPaneDiv.style.overflowY = 'auto';

        // Render PDF page into canvas context
        var renderContext = {
        canvasContext: ctx,
        viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
        pageRendering = false;
        if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
        }
        }).then(function() {
        // Returns a promise, on resolving it will return text contents of the page
        return page.getTextContent();
        }).then(function(textContent) {

        // Assign CSS to the textLayer element
        var textLayer = document.getElementById("textLayer");

        textLayer.style.left = canvas.offsetLeft + 'px';
        textLayer.style.top = canvas.offsetTop + 'px';
        textLayer.style.height = canvas.offsetHeight + 'px';
        textLayer.style.width = canvas.offsetWidth + 'px';

        // Pass the data to the method for rendering of text over the pdf canvas.
        pdfjsLib.renderTextLayer({
            textContent: textContent,
            container: textLayer,
            viewport: viewport,
            textDivs: []
        });
        });
    });

    // Update page counters
    document.getElementById('page_num').textContent = num;

    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
    }

    /**
     * Displays previous page.
     */
    function onPrevPage() {
    if (pageNum <= 1) {
        return;
    }
    if(window['selElem']){
        $(window['selElem']).removeHighlight();
    }
    window['pageNo'] = pageNum <= 1 ? 1 : pageNum - 1;
    pageNum--;
    queueRenderPage(pageNum);
    }
    document.getElementById('prev').addEventListener('click', onPrevPage);

    /**
     * Displays next page.
     */
    function onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    if(window['selElem']){
        $(window['selElem']).removeHighlight();
    }
    window['pageNo'] = pageNum >= pdfDoc.numPages ? pdfDoc.numPages : pageNum + 1;
    pageNum++;
    queueRenderPage(pageNum);
    }
    document.getElementById('next').addEventListener('click', onNextPage);

    /**
     * Asynchronously downloads PDF.
     */
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering
    renderPage(pageNum);
    });

    /**
     * Add event listener on user selects a text in the PDF.
    */
    document.addEventListener('selectionchange', () => {
        //console.log(document.getSelection());
      });

    /**
     * Retrieve the text selected and copy it to respective variable.
     * Copy / highlight only the text in the PDF window
    */
    document.onselectionchange = () => {
        var textLayer = document.getElementById("textLayer");
        let selectedInpElement = window['selectedInputElem'];
        let pdfDetails = window['pdfValues'];
        let tempDetails = window['tempDetails'];

        textLayer.onmouseup = function(e){
            var text = getSelectedText();

            var range = window.getSelection().getRangeAt(0);
            var rect = range.getBoundingClientRect();
            if(text)
            {
                if(selectedInpElement !== undefined && selectedInpElement !== null){
                    selectedInpElement.setAttribute("value", '');
                    selectedInpElement.setAttribute("value", text.trim());

                    let itm = selectedInpElement.getAttribute("txt-label");
                    tempDetails[itm].domRect = rect && rect.toJSON() ? rect.toJSON() : null;
                    tempDetails[itm].value = text.trim();
                    tempDetails[itm].pageNumber = pageNum;
                    pdfDetails[itm] = text.trim();

                    //save values selected to output variable pdfValues
                    // Appian.Component.saveValue('pdfValues', pdfDetails);
                    window['pdfValues'] = pdfDetails;
                    document.getElementById("output-value-json").innerHTML = JSON.stringify(pdfDetails);
                }
            }
        }

    };

    /**
     * Retrieve the text selected.
    */
    function getSelectedText() {
        if (window.getSelection) {
           return window.getSelection().toString();
        }
        else if (document.selection) {
            return document.selection.createRange().text;
        }
        return '';
    }



}
