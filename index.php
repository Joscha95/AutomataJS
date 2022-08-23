<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title></title>
    <link rel="stylesheet" href="css/index.css?v=<?=filemtime('css/index.css')?>">
  </head>
  <body>
    <canvas id="canvas" resize></canvas>
    <div id="inspector">
      <h3>Inspector</h3>
      <ul>
        <li>
          <label for="statename">Name </label>
          <input type="text" name="statename" value="">
        </li>
        <li>
          <label for="duration">Duration </label>
          <input type="number" name="duration" value="">
        </li>
        <li>
          <label for="triggered">Triggered </label>
          <input type="checkbox" name="triggered" >
        </li>
        <li><span id="el_progress">0</span> <span id="el_elapsed">0</span> </li>
        <li><button type="button" name="delete">delete</button></li>
      </ul>
    </div>
  </body>
  <footer>
    <script type="text/javascript" src="https://unpkg.com/acorn"></script>
    <script src="js/paper-full.min.js" type="text/javascript"></script>
    <script src="js/objects.js?v=<?=filemtime('js/objects.js')?>" type="text/javascript" canvas="canvas"></script>
    <script src="js/automatapaper.js?v=<?=filemtime('js/automatapaper.js')?>" type="text/javascript"  canvas="canvas"></script>
    <script src="js/index.js?v=<?=filemtime('js/index.js')?>" type="text/javascript"></script>
  </footer>
</html>