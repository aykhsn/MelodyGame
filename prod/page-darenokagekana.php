<?php
/*
Template Name: だれのかげかな？
*/
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?> <?php Arkhe::root_attrs(); ?>>
<head>
<meta charset="utf-8">
<meta name="format-detection" content="telephone=no">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, viewport-fit=cover">
<script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
<?php
	wp_head();
	$setting = Arkhe::get_setting(); // SETTING取得
?>
<style>
    body {
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #87CEEB;
        overflow: hidden;
    }
</style>
</head>
<body>
<script src="<?php echo get_template_directory_uri(); ?>/dist/js/games/homeButton.js"></script>
<script>
    /*! For license information please see bundle.js.LICENSE.txt */
</script>
</body>
</html>