window.addEventListener('load', () => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  resizeCanvas(canvas);

  window.addEventListener('resize', () => resizeCanvas(canvas)); //resize canvas whenever window is resized

  //HIDE TOOLBAR AFTER 5 SEC SO USERS KNOW IT'S THERE
  setTimeout(() => {
    let toolbar = document.getElementById('tools');
    toolbar.classList.add('hidden'); // Add the 'hidden' class
  }, 5000);

  /* DRAWING APP */
  //PENCIL LINES
  let drawing = false; //keep track of whether we should be drawing (on click and drag)
  let lineThickness = 5;
  let pencilColour = '#000000';
  let eraser = false; //track whether user wants to erase
  let eraserSize = 20;

  function startDrawing(e) {
    drawing = true;
    draw(e); //draw dots when the user clicks without dragging
  }

  function finishDrawing() {
    drawing = false;
    ctx.beginPath(); //the next time the user clicks, draw from the new position
  }

  function draw(e) {
    if (!drawing || eraser) return; //don't draw

    ctx.lineWidth = lineThickness;
    ctx.strokeStyle = pencilColour;
    ctx.lineCap = 'round';

    ctx.lineTo(e.clientX, e.clientY); //x and y positions of mouse
    ctx.stroke();

    //lines drawn are less pixelated
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY);
  }

  //only draw when mouse is down
  canvas.addEventListener('mousedown', (e) => {
    startDrawing(e);
    erase(e);
  });
  canvas.addEventListener('mouseup', finishDrawing);
  canvas.addEventListener('mousemove', (e) => {
    draw(e);
    showEraser(e);
    erase(e);
  });

  /* TOOLBAR */
  //variables
  let pencilSlider = document.getElementById('thicknessSlider'); //pencil thickness range input
  let eraserSlider = document.getElementById('eraserSizeSlider');
  let picker = document.getElementById('colourInput'); //get colour input
  let colourButtons = document.querySelectorAll('.colour'); //get all colour buttons
  //buttons to switch btwn pencil and eraser
  let btnPencil = document.getElementById('btnPencil');
  let btnEraser = document.getElementById('btnEraser');

  //clear canvas on button click
  document.getElementById('clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  //PENCIL
  //change pencil thickness and display updated thickness as slider is updated
  pencilSlider.addEventListener('input', () => {
    lineThickness = Number(pencilSlider.value);

    let output = document.getElementById('pencilThickness');
    output.innerHTML = pencilSlider.value + 'px'; //display value

    let dot = document.getElementById('thicknessDisplay');
    //change dot size
    dot.style.width = pencilSlider.value + 'px';
    dot.style.height = pencilSlider.value + 'px';
  });

  //change pencil colour
  function changeColour(colour) {
    //colour is optional parameter
    if (colour) {
      pencilColour = colour;
      picker.parentNode.style.backgroundColor = colour;
      return;
    }

    //if colour isn't specified, get it from colour picker
    pencilColour = picker.value;
    picker.parentNode.style.backgroundColor = picker.value;
  }

  picker.addEventListener('input', () => {
    changeColour();
  });

  //change colour when colour btns are clicked
  colourButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.id === 'red') changeColour('#ff0000');
      else if (btn.id === 'blue') changeColour('#0000ff');
      else changeColour('#ffff00'); //yellow
    })
  });

  //Switch btwn pencil and eraser when icons are clicked
  btnPencil.addEventListener('click', () => {
    eraser = false;
    canvas.style.cursor = 'default'; //show default cursor

    //hide eraser cursor immediately pencil is clicked
    let eraserCursor = document.getElementById('eraserCursor');
    eraserCursor.style.display = 'none';

    //display pencil controls
    btnPencil.classList.add('active');
    btnEraser.classList.remove('active');
    let pencilTool = document.getElementById('pencilTool');
    pencilTool.classList.add('visible');
    let eraserTool = document.getElementById('eraserTool');
    eraserTool.classList.remove('visible');
  });

  btnEraser.addEventListener('click', () => {
    eraser = true;
    canvas.style.cursor = 'none'; //hide default cursor

    //display eraser controls
    btnPencil.classList.remove('active');
    btnEraser.classList.add('active');
    let pencilTool = document.getElementById('pencilTool');
    pencilTool.classList.remove('visible');
    let eraserTool = document.getElementById('eraserTool');
    eraserTool.classList.add('visible');
  });

  //ERASER  
  //Display eraser size in numbers and visually (box) as slider is updated
  eraserSlider.addEventListener('input', () => {
    eraserSize = Number(eraserSlider.value);

    let output = document.getElementById('eraserSize');
    output.innerHTML = `${eraserSize}px`; //display value

    let box = document.getElementById('eraserSizeDisplay');
    //change dot size to 1/4 of eraser size for space
    box.style.width = `${eraserSize / 4}px`;
    box.style.height = `${eraserSize / 4}px`;
  });

  //show eraser cursor
  function showEraser(e) {
    let eraserCursor = document.getElementById('eraserCursor');

    if (eraser) {
      //set eraser size
      eraserCursor.style.width = `${eraserSize}px`;
      eraserCursor.style.height = `${eraserSize}px`;

      // Position the eraser so it's centred over the cursor
      eraserCursor.style.left = `${e.clientX - eraserSize / 2}px`;
      eraserCursor.style.top = `${e.clientY - eraserSize / 2}px`;
      eraserCursor.style.display = 'block'; //display eraser cursor
    }
  }

  function erase(e) {
    //if we're erasing and holding down the mouse
    if (eraser && drawing) {
      const rect = canvas.getBoundingClientRect(); // Get canvas bounds
      /* e.clientX and clientY are mouse position relative to the viewport but I need the x and y
      coordinates relative to canvas to call clearRect correctly. rect.left and rect.top are canvas
      position relative to viewport. Using these, I calculate x and y coordinates relative to the
      canvas not viewport */
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
    }
  }

  //EXPORT canvas
  document.getElementById('export').addEventListener('click', () => {
    const dataUrl = canvas.toDataURL({format: 'png'});
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = 'drawing.png';
    downloadLink.click();
  })

});

//resize canvas when window is resized
function resizeCanvas(canvas) {
  //setting size using css zooms in on the canvas making things appear pixelated; making size 99% prevents scrollbars
  canvas.width = window.innerWidth * 0.99;
  canvas.height = window.innerHeight * 0.99;
}