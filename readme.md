Тестовое задание в Школу Node.JS
================================



Настройка nginx
---------------



1. Nginx

	В каталог /etc/nginx/conf.d кладём файл с расширением conf и содержимым:

	~~~
	server {
		server_name yatest.home;
		location / {
			root /home/sergei/Documentos/yandex_js_test;
		}
	}
	~~~

	, где `yatest.home` - доменное имя сайта, а `/home/sergei/Documentos/yandex_js_test` - каталог расположения данных сайта.

2. hosts

	Добавляем в /etc/hosts строчку:

	~~~
	127.0.1.1	yatest.home
	~~~

