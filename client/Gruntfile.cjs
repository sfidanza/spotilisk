module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: ['target/*'],
		copy: {
			build: {
				files: [
					{ expand: true, cwd: 'src/', src: ['img/**'], dest: 'target/static/' },
					{ expand: true, cwd: 'src/', src: ['**/*.js'], dest: 'target/static/' },
					{ expand: true, cwd: 'src/', src: ['*.html'], dest: 'target/static/' }
				]
			}
		},
		concat: {
			target: {
				dest: 'target/static/app.css',
				src: ['src/**/*.css'],
			}
		},
		mergeTemplates: {
			target: {
				dest: 'target/static/app.json',
				src: ['src/templates/**/*.html']
			}
		},
		eslint: {
			// options: { fix: true },
			target: ['src/**/*.js']
		},
		csslint: {
			options: {
				csslintrc: '.csslintrc'
			},
			src: ['src/**/*.css']
		},
		watch: {
			all: {
				files: 'Gruntfile.cjs',
				tasks: 'default'
			},
			csslint: {
				files: ['.csslintrc', 'src/**/*.css'],
				tasks: ['csslint']
			},
			css: {
				files: ['src/**/*.css'],
				tasks: ['concat']
			},
			eslint: {
				files: ['.eslintrc', 'src/**/*.js'],
				tasks: ['eslint']
			},
			tpl: {
				files: ['src/templates/**/*.html'],
				tasks: ['mergeTemplates']
			},
			copy: {
				files: ['src/img/**', 'src/**/*.js', 'src/*.html'],
				tasks: ['copy']
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadTasks('build/tasks');

	// Default tasks
	grunt.registerTask('default', ['eslint', 'csslint', 'clean', 'copy', 'concat', 'mergeTemplates']);
};
