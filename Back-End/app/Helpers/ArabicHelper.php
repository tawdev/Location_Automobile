<?php

use ArPHP\I18N\Arabic;

if (!function_exists('arabic')) {
    function arabic(string $text): string
    {
        static $instance = null;
        if ($instance === null) {
            $instance = new Arabic();
        }
        return $instance->utf8Glyphs($text, 50, false, true);
    }
}
