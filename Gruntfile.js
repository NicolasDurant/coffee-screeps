module.exports = function (grunt) {
  require('time-grunt')(grunt);

  // Pull defaults (including username and password) from .screeps.json
  var config = require('./.screeps.json');

  // Allow grunt options to override default configuration
  var branch = grunt.option('branch') || config.branch;
  var email = grunt.option('email') || config.email;
  var local = grunt.option('local') || config.local;
  var password = grunt.option('password') || config.password;
  var ptr = grunt.option('ptr') ? true : config.ptr;
  var private_directory =
    grunt.option('private_directory') || config.private_directory;

  var currentdate = new Date();
  grunt.log.subhead('Task Start: ' + currentdate.toLocaleString());
  grunt.log.writeln('Branch: ' + branch);

  // Load needed tasks
  grunt.loadNpmTasks('grunt-screeps');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-file-append');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-rsync');

  grunt.initConfig({
    // Push all files in the dist folder to screeps. What is in the dist folder
    // and gets sent will depend on the tasks used.
    screeps: {
      options: {
        email: email,
        password: password,
        branch: branch,
        ptr: ptr,
      },
      dist: {
        src: ['dist/*.js'],
      },
    },
    // Copy all source files into the dist folder, flattening the folder
    // structure by converting path delimiters to underscores
    copy: {
      // Pushes the game code to the dist folder so it can be modified before
      // being send to the screeps server.
      screeps: {
        files: [
          {
            expand: true,
            cwd: 'lib/',
            src: '**',
            dest: 'dist/',
            filter: 'isFile',
            rename: function (dest, src) {
              // Change the path name utilize underscores for folders
              return dest + src.replace(/\//g, '_');
            },
          },
        ],
      },
      // Pushes the game code to the local folder set in .screeps.json
      local: {
        files: [
          {
            expand: true,
            cwd: 'dist/',
            src: '**',
            dest: local,
            filter: 'isFile',
          },
        ],
      },
    },
    // Copy files to the folder the client uses to sink to the private server.
    // Use rsync so the client only uploads the changed files.
    rsync: {
      options: {
        args: ['--verbose', '--checksum'],
        exclude: ['.git*'],
        recursive: true,
      },
      private: {
        options: {
          src: './dist/',
          dest: private_directory,
        },
      },
    },
    // Add version variable using current timestamp.
    file_append: {
      versioning: {
        files: [
          {
            append: '\nglobal.SCRIPT_VERSION = ' + currentdate.getTime() + '\n',
            input: 'dist/version.js',
          },
        ],
      },
    },
    // Remove all files from the dist folder.
    clean: {
      dist: ['dist'],
      lib: ['lib'],
      local: {
        options: {
          force: true,
        },
        src: [local],
      },
    },
    // Apply code styling
    jsbeautifier: {
      modify: {
        src: ['lib/**/*.js'],
        options: {
          config: '.jsbeautifyrc',
        },
      },
      verify: {
        src: ['lib/**/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc',
        },
      },
    },
    /**
     * Before we can apply any of the above tasks to our screeps code,
     * we first have to compile our `.coffee` files into plain `.js files`.
     */
    run: {
      coffee: {
        exec: 'coffee --compile --output lib/ src/',
      },
    },
  });
  // for descriptions check the README.md
  grunt.registerTask('default', [
    'clean',
    'run:coffee',
    'copy:screeps',
    'file_append:versioning',
    'copy:local',
  ]);
  grunt.registerTask('update', [
    'clean:dist',
    'clean:lib',
    'run:coffee',
    'copy:screeps',
    'file_append:versioning',
    'screeps', // the push to the account -> so only in this script
  ]);
  grunt.registerTask('compile-only', ['clean:dist', 'clean:lib', 'run:coffee']);
  grunt.registerTask('push-only', [
    'copy:screeps',
    'file_append:versioning',
    'screeps',
  ]);
  // grunt init && grunt test
  grunt.registerTask('test', ['jsbeautifier:verify']);
  // grunt init && grunt test
  grunt.registerTask('pretty', ['jsbeautifier:modify']);
};
