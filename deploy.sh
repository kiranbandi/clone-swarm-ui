#!/bin/sh
# Script to update apache server
# stop apache server
service apache2 stop
# clear old assets
rm -rf /var/www/html/
# copy new assets
cp -a build/. /var/www/html/
# restart apache server
service apache2 restart
