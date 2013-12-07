## Installation

The installation is complex and will be sorted out later.

After pulling, it is always a good idea to run
`php artisan dump-autoload`
`php artisan migrate`
`php artisan db:seed`

## Installation for original proof-of-concept

For now, you must have a webserver running as jr.glo.lan

Install node.js from http://nodejs.org/

From the command line run (in the root of the cloned repository):

`npm install jquery`

and

`npm install socket.io`

then run:

`node server.js`
