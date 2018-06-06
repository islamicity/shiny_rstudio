module.exports = function(grunt) {

  var rootDir = __dirname;

  var instdir = rootDir + '/inst/';
  var js_srcdir = rootDir + '/srcjs/'

  gruntConfig = {
    pkg: pkgInfo(),

    clean: {
      options: { force: true },
      src: [
        instdir + "www/shared/shiny.js",
        instdir + "www/shared/shiny.js.map",
        instdir + "www/shared/shiny.min.js",
        instdir + "www/shared/shiny.min.js.map",
        "./temp_concat/shiny.js",
        "./temp_concat/shiny.js.map",
        instdir + 'www/shared/datepicker/js/bootstrap-datepicker.min.js',
        instdir + 'www/shared/ionrangeslider/js/ion.rangeSlider.min.js'
      ]
    },

    concat: {
      options: {
        process: function(src, filepath) {
          return '//---------------------------------------------------------------------\n' +
            '// Source file: ' + filepath + '\n\n' + src;
        },
        sourceMap: true
      },
      shiny: {
        src: [
          js_srcdir + '_start.js',
          js_srcdir + 'utils.js',
          js_srcdir + 'browser.js',
          js_srcdir + 'input_rate.js',
          js_srcdir + 'shinyapp.js',
          js_srcdir + 'notifications.js',
          js_srcdir + 'modal.js',
          js_srcdir + 'file_processor.js',
          js_srcdir + 'binding_registry.js',
          js_srcdir + 'output_binding.js',
          js_srcdir + 'output_binding_text.js',
          js_srcdir + 'output_binding_image.js',
          js_srcdir + 'output_binding_html.js',
          js_srcdir + 'output_binding_downloadlink.js',
          js_srcdir + 'output_binding_datatable.js',
          js_srcdir + 'output_binding_adapter.js',
          js_srcdir + 'input_binding.js',
          js_srcdir + 'input_binding_text.js',
          js_srcdir + 'input_binding_textarea.js',
          js_srcdir + 'input_binding_password.js',
          js_srcdir + 'input_binding_number.js',
          js_srcdir + 'input_binding_checkbox.js',
          js_srcdir + 'input_binding_slider.js',
          js_srcdir + 'input_binding_date.js',
          js_srcdir + 'input_binding_daterange.js',
          js_srcdir + 'input_binding_select.js',
          js_srcdir + 'input_binding_radio.js',
          js_srcdir + 'input_binding_checkboxgroup.js',
          js_srcdir + 'input_binding_actionbutton.js',
          js_srcdir + 'input_binding_tabinput.js',
          js_srcdir + 'input_binding_fileinput.js',
          js_srcdir + 'init_shiny.js',
          js_srcdir + 'reactlog.js',
          js_srcdir + '_end.js'
        ],
        // The temp_concat/ directory would have gone under /srcjs/, but the
        // Babel Grunt plugin has trouble finding presets if it operates on a
        // file that's not under the current directory. So we'll put it under
        // ./
        dest: './temp_concat/shiny.js',
        nonull: true
      },
    },

    "string-replace": {
      version: {
        files: {
          './temp_concat/shiny.js': './temp_concat/shiny.js'
        },
        options: {
          replacements: [{
            pattern: /{{ VERSION }}/g,
            replacement: pkgInfo().version
          }]
        }
      }
    },

    babel: {
      shiny: {
        src: './temp_concat/shiny.js',
        dest: instdir + '/www/shared/shiny.js',
        options: {
          sourceMap: true,
          compact: false,
          presets: ['es2015']
        },
      },
      reactLog: {
        src: instdir + "/www/rlog/src/index.js",
        dest: instdir + "/www/rlog/dest/reactLog.js",
        options: {
          babelrc: true // use the local babelrc file for config
          // sourceMap: true,
          // compact: false,
          // presets: ["flow", "es2015"],
          // plugins: [
          //   ["transform-es2015-modules-umd", {
          //     // "globals": {
          //     //   "es6-promise": "Promise"
          //     // }
          //   }]
          // ]
        }
      }
    },

    eslint: {
      options: {
        parser: 'babel-eslint',
        format: require('eslint-stylish-mapped'),
        extends: 'eslint:recommended',
        rules: {
          "consistent-return": 1,
          "dot-location": [1, "property"],
          "eqeqeq": 1,
          // "no-shadow": 1,
          "no-undef": 1,
          "no-unused-vars": [1, {"args": "none"}],
          "guard-for-in": 1,
          // "no-use-before-define": [1, {"functions": false}],
          "semi": [1, "always"]
        },
        envs: [
          "es6",
          "browser",
          "jquery"
        ],
        globals: ["strftime"]
      },
      shiny: ['./temp_concat/shiny.js']
      // ,
      // reactLog: {
      //   src: [instdir + "www/rlog/src/**/*.js"],
      //   options: {
      //     parser: "babel-eslint",
      //     extends: ["plugin:flowtype/recommended"],
      //     plugins: ["flowtype"]
      //   }
      // }

    },

    uglify: {
      shiny: {
        options: {
          banner: '/*! <%= pkg.name %> <%= pkg.version %> | ' +
                  '(c) 2012-<%= grunt.template.today("yyyy") %> RStudio, Inc. | ' +
                  'License: <%= pkg.license %> */\n',
          sourceMap: true,
          // Base the .min.js sourcemap off of the .js sourcemap created by concat
          sourceMapIn: instdir + 'www/shared/shiny.js.map',
          sourceMapIncludeSources: true
        },
        src: instdir + 'www/shared/shiny.js',
        dest: instdir + 'www/shared/shiny.min.js'
      },
      datepicker: {
        src: [
          instdir + 'www/shared/datepicker/js/bootstrap-datepicker.js',
          instdir + 'www/shared/datepicker/js/locales/bootstrap-datepicker.*.js'
        ],
        dest: instdir + 'www/shared/datepicker/js/bootstrap-datepicker.min.js'
      },
      ionrangeslider: {
        src: instdir + 'www/shared/ionrangeslider/js/ion.rangeSlider.js',
        dest: instdir + 'www/shared/ionrangeslider/js/ion.rangeSlider.min.js'
      }
    },

    watch: {
      shiny: {
        files: ['<%= concat.shiny.src %>', rootDir + '/DESCRIPTION'],
        tasks: [
          'newer:concat',
          'newer:eslint:shiny',
          'configureBabelShiny',
          'newer:babel:shiny',
          'newer:uglify'
        ]
      },
      datepicker: {
        files: '<%= uglify.datepicker.src %>',
        tasks: ['newer:uglify:datepicker']
      },
      reactlog: {
        files: [instdir + "www/rlog/react_graph.js"],
        tasks: [
          // "prettier:reactLog",
          "newer:eslint:reactLog"
        ]
      },
      reactlogCSS: {
        files: [instdir + "www/rlog/*.css"],
        tasks: ["newer:prettier:reactLogCSS"]
      }
    },

    newer: {
      options: {
        override: function(detail, include) {
          // If DESCRIPTION is updated, we'll also need to re-minify shiny.js
          // because the min.js file embeds the version number.
          if (detail.task === 'uglify' && detail.target === 'shiny') {
            include(isNewer(rootDir + '/DESCRIPTION', detail.time));
          } else {
            include(false);
          }

        }
      }
    },

    prettier: {
      reactLogCSS: {
        src: [instdir + "www/rlog/**/*.css"]
      },
      reactLog: {
        // Target-specific file lists and/or options go here.
        src: [
          instdir + "www/rlog/src/**/*.js"
        ]
      },
    },

    webpack: {
      options: {
        mode: "development", // do not take time to shrink files;
        devtool: "source-map", // produce a sibling source map file
        stats: {
          colors: true,
          modules: true,
          reasons: true
        },
        progress: true,
        failOnError: true,
        // externals: {
        //   jQuery : {
        //     root: "$" // indicates global variable
        //   },
        //   lodash : {
        //     root: "_" // indicates global variable
        //   }
        // },
        // optimization: {
        //   minimize: false // uglify the code
        // },

      },
      reactLog: {
        entry: [instdir + "www/rlog/src/index.js"],
        output: {
          path: instdir + "www/rlog/dest/",
          filename: 'reactLog.js'
        },
        watch: false,
        module: {
          rules: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: "babel-loader"
                  // babelrc: true
                  // ,
                  // options: {
                  //   sourceMap: true,
                  //   compact: false,
                  //   presets: ["flow", "es2015"],
                  //   plugins: [
                  //     ["transform-es2015-modules-umd", {
                  //       "globals": {
                  //         "es6-promise": "Promise"
                  //       }
                  //     }]
                  //   ]
                  // }
                }
              ]
            }
          ]
        }
      }
    }

  };

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-prettier');
  grunt.loadNpmTasks('grunt-webpack');


  // Need this here so that babel reads in the source map file after it's
  // generated. Without this task, it would read in the source map when Grunt
  // runs, which is wrong, if the source map doesn't exist, or is change later.
  grunt.task.registerTask("configureBabelShiny", "configures babel options", function() {
    gruntConfig.babel.shiny.options.inputSourceMap = grunt.file.readJSON('./temp_concat/shiny.js.map');
  });

  grunt.task.registerTask("webpackReactLogWatch", "sets 'watch' to true for reactLog webpack task", function() {
    gruntConfig.webpack.reactLog.watch = true
  });


  grunt.initConfig(gruntConfig);

  grunt.registerTask('shiny', [
    'newer:concat',
    'newer:string-replace',
    'newer:eslint:shiny',
    'configureBabelShiny',
    'newer:babel:shiny',
    'newer:uglify:shiny',
    'newer:uglify:datepicker',
    'newer:uglify:ionrangeslider'
  ]);

  // grunt.registerTask("reactLog", [
  //   "prettier:reactLog",
  //   "prettier:reactLogCSS",
  //   "eslint:reactLog",
  //   "babel:reactLog"
  // ])
  // grunt.registerTask("reactLog-staged", [
  //   "newer:prettier:reactLog",
  //   "newer:prettier:reactLogCSS",
  //   "newer:eslint:reactLog"
  // ])

  grunt.registerTask("default", "shiny")


  // ---------------------------------------------------------------------------
  // Utility functions
  // ---------------------------------------------------------------------------

  // Return an object which merges information from package.json and the
  // DESCRIPTION file.
  function pkgInfo() {
    var pkg = grunt.file.readJSON('package.json');

    pkg.name    = descKeyValue('Package');
    pkg.version = descKeyValue('Version');
    pkg.license = descKeyValue('License');

    return pkg;
  }

  // From the DESCRIPTION file, get the value of a key. This presently only
  // works if the value is on one line, the same line as the key.
  function descKeyValue(key) {
    var lines = require('fs').readFileSync(rootDir + '/DESCRIPTION', 'utf8').split('\n');

    var pattern = new RegExp('^' + key + ':');
    var txt = lines.filter(function(line) {
      return pattern.test(line);
    });

    txt = txt[0];

    pattern = new RegExp(key + ': *');
    txt = txt.replace(pattern, '');

    return txt;
  }

  // Return true if file's mtime is newer than mtime; false otherwise.
  function isNewer(file, mtime) {
    return require('fs').statSync(file).mtime > mtime;
  }
};
