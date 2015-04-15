'use strict';

var gulp = require('gulp'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    wiredep = require('wiredep'),
    streamqueue  = require('streamqueue'),
    $ = require('gulp-load-plugins')();

var config = {
    bowerDir: './bower_components',
    sassPath: './app/sass',
}

gulp.task('run-bower', function() {
    return $.bower()
        .pipe(gulp.dest(config.bowerDir));
});


gulp.task('vendor-scripts', function() {
  return gulp.src(wiredep().js)
    .pipe(gulp.dest('public/vendor'));
});

gulp.task('fix-wizardry', function(){
    return gulp.src(config.bowerDir + '/csswizardry-grids/csswizardry-grids.scss')
    .pipe($.insert.prepend('@charset "UTF-8";'))
    .pipe(gulp.dest(config.bowerDir + '/csswizardry-grids'));
    
});

gulp.task('link-assets', ['scripts', 'styles', 'vendor-scripts'], function() {

  return gulp.src('app/*.html')
    .pipe(wiredep.stream({
      fileTypes: {
        html: {
          replace: {
            js: function(filePath) {
              return '<script src="' + 'vendor/' + filePath.split('/').pop() + '"></script>';
            }
          }
        }
      }
    }))
    .pipe($.inject(
      gulp.src(['public/scripts/*.js'], { read: false }), {
        addRootSlash: false,
        transform: function(filePath, file, i, length) {
          return '<script src="' + filePath.replace('public/', '') + '"></script>';
        }
    }))
    .pipe($.inject(
      gulp.src(['public/styles/**/*.css'], { read: false }), {
        addRootSlash: false,
        transform: function(filePath, file, i, length) {
          return '<link rel="stylesheet" href="' + filePath.replace('public/', '') + '"/>';
        }
      }))
    .pipe($.fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('public'));
});


gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('public'))
        .use(connect.directory('public'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});


gulp.task('serve', ['connect'], function () {
    require('opn')('http://localhost:9000');
});



gulp.task('styles', function () {
    return gulp.src('app/sass/**/*.scss')
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            lineNumbers: true,
            loadPath: [
                 './app/sass',
                 config.bowerDir + '/bootstrap-sass-official/',
                 config.bowerDir + '/bootswatch-sass/',
                 config.bowerDir + '/csswizardry-grids/'
                 //config.bowerDir + '/Hover/scss/'
            ]
         }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('public/styles'))
        .pipe(reload({stream:true}))
        .pipe($.size());
});


gulp.task('minifyStyles', ['fileinclude','styles'], function() {
    return gulp.src('public/styles/*.css')
//         .pipe($.uncss({
//            html: ['public/index.html']
//         }))
        .pipe($.combineMediaQueries())
        .pipe($.autoprefixer('last 1 version'))
        .pipe($.minifyCss({keepBreaks:false}))
        .pipe(gulp.dest('public/styles'))
        .pipe(reload({stream:true}));    
});

gulp.task('images', function() {
  return gulp.src('app/images/*')
    .pipe($.imagemin({ 
        optimizationLevel: 5, 
        progressive: true, 
        interlaced: true }))
    .pipe(gulp.dest('public/images'));
});

gulp.task('scripts', function () {
    return streamqueue({ objectMode: true },
        gulp.src('public/scripts/vendor/jquery.js'),
        gulp.src('public/scripts/vendor/dropdown.js'),
        gulp.src('public/scripts/vendor/modal.js'),        
        gulp.src('app/scripts/main.js')
    )
    //return gulp.src(['app/scripts/**/*.js'])
    //    .pipe($.jshint())
    //    .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.concat("main.js"))
        .pipe($.size())
        .pipe(gulp.dest("public/scripts"));
});

gulp.task('minifyJS', ['scripts'], function () {    
    return gulp.src('public/scripts/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.stripDebug())
        .pipe($.uglify())    
        .pipe($.size())
        .pipe(gulp.dest("public/scripts"));
});


gulp.task('fonts', function() {
    return gulp.src([config.bowerDir+'/bootstrap-sass-official/assets/fonts/bootstrap/*'])
        .pipe(gulp.dest('public/fonts'));
});

gulp.task('vendor-scripts-to-concat', function() {
    return gulp.src([config.bowerDir+'/bootstrap-sass-official/assets/javascripts/bootstrap/*.js', config.bowerDir+'/jquery/dist/jquery.js' ])
        .pipe(gulp.dest('public/scripts/vendor'));
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/styles/*.scss')
        .pipe(wiredep({
            directory: '/bower_components'
        }))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: '/bower_components',
            exclude: ['bootstrap-sass-official']
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    gulp.watch('app/sass/**/*.scss', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/*', ['images']);
    gulp.watch('app/*.html', ['fileinclude', 'link-assets']);
    gulp.watch('app/partials/*.html', ['fileinclude', 'link-assets']);
    gulp.watch('bower.json', ['install', 'link-assets']);
    
    gulp.watch([
        'public/*.html',
        'public/styles/*.css',
        'public/scripts/*.js',
        'public/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

});

gulp.task('fileinclude', function() {
  gulp.src('app/*.html')
    .pipe($.fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('public/'));
});


gulp.task('default', ['link-assets', 'images', 'connect', 'serve', 'watch']);

gulp.task('build', ['link-assets', 'minifyStyles', 'minifyJS', 'images', 'serve']);


gulp.task('install', ['run-bower', 'fonts', 'vendor-scripts-to-concat','fix-wizardry']); //always run in gitshell