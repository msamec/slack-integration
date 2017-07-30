<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html lang="en">
<head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <title>Diff</title>
    <link rel="stylesheet" type="text/css" href="node_modules/diff2html/dist/diff2html.min.css">
</head>
<body>
    <?php echo getHtml(); ?>
    <script type="text/javascript" src="node_modules/diff2html/dist/diff2html.min.js"></script>
    <script type="text/javascript" src="node_modules/diff2html/dist/diff2html-ui.min.js"></script>
</body>
</html>

<?php
    function getHtml()
    {
        $userId = $_GET['user_id'];
        $date = $_GET['date'];
        $file = 'patches/'.$userId.'/'.$date.'.html';
        if(!file_exists($file)) {
            die('File does not exist!');
        }

        return file_get_contents($file);
    }
?>