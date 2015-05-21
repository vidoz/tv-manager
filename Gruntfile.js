module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        json: {
            manifest: {
                options: {
                    namespace: 'manifests',
                    includePath: true,
                    processName: function(filename) {
                        filename = filename.split("/");
                        return filename[filename.length-2];
                    }
                },
                src: ['app/modules/**/manifest.json'],
                dest: 'app/resources/manifests.js'
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-json');

    // Default task(s).
    grunt.registerTask('default', ['json']);
};