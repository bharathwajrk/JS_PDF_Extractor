// NOT IN  USE
function pdfViewerPagination(url){
// If absolute URL from the remote server is provided, configure the CORS

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
// pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@latest/build/pdf.worker.min.js';
// pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1,
    canvas = document.getElementById('pdf-reader-right-pane'),
    ctx = canvas.getContext('2d');

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

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };


		page.render(renderContext).promise.then(function() {
			pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
			// Return the text contents of the page after the pdf has been rendered in the canvas
			return page.getTextContent();
		}).then(function(textContent) {
			// Get canvas offset
      var textLayer = document.getElementById('text-layer');
			// Clear HTML for text layer
			textLayer.innerHTML = '';
console.log(textLayer);
			// Assign the CSS created to the text-layer element
			textLayer.style.cssText = 'left:'+ canvas.offsetLeft + 'px', 'top:'+ canvas.offsetTop + 'px', 'height:'+ canvas.height + 'px', 'width:'+ canvas.width + 'px' ;

			// Pass the data to the method for rendering of text over the pdf canvas.
			pdfjsLib.renderTextLayer({
			    textContent: textContent,
			    container: textLayer,
			    viewport: viewport,
			    textDivs: []
			});
		});

    // var renderTask = page.render(renderContext);


    // // Wait for rendering to finish
    // renderTask.promise.then(function() {
    //   pageRendering = false;
    //   if (pageNumPending !== null) {
    //     // New page rendering is pending
    //     renderPage(pageNumPending);
    //     pageNumPending = null;
    //   }
    // });

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


  // addEventListener version
  document.addEventListener('selectionchange', () => {
    console.log(document.getSelection());
  });

  // onselectionchange version
  document.onselectionchange = () => {
    var text = getSelectedText();

    if(text)
    {
      alert(text); 

    }
  };

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