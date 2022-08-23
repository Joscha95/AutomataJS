#!/bin/sh
killall -9 php
here="`dirname \"$0\"`"
#echo "cd-ing to $here"
cd "$here" || exit 1
open -a firefox -g http://localhost:8888/
open -a atom $here
php -S localhost:8888