// rename files in the current directory
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const usage = `
Usage: node rename.js [options]
Options:
  -d, --directory <path>    Directory containing files (default: current directory)
  -f, --from <extension>    Source file extension (e.g., CHK)
  -t, --to <extension>      Target file extension (e.g., mp4)
  -p, --preview             Preview changes without renaming
  -h, --help                Show this help message
`;

// Default values
let options = {
    directory: '.',
    fromExt: '',
    toExt: '',
    preview: false
};

// Parse arguments
for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '-d':
        case '--directory':
            options.directory = args[++i];
            break;
        case '-f':
        case '--from':
            options.fromExt = args[++i].toLowerCase();
            break;
        case '-t':
        case '--to':
            options.toExt = args[++i].toLowerCase();
            break;
        case '-p':
        case '--preview':
            options.preview = true;
            break;
        case '-h':
        case '--help':
            console.log(usage);
            process.exit(0);
        default:
            console.error('Unknown option:', args[i]);
            console.log(usage);
            process.exit(1);
    }
}

// Validate required arguments
if (!options.fromExt || !options.toExt) {
    console.error('Error: Both source (-f) and target (-t) extensions are required');
    console.log(usage);
    process.exit(1);
}

// Function to rename files
async function renameFiles() {
    try {
        // Check if directory exists
        if (!fs.existsSync(options.directory)) {
            throw new Error(`Directory "${options.directory}" does not exist`);
        }

        // Read all files in the directory
        const files = fs.readdirSync(options.directory);
        
        // Filter files by extension (case-insensitive)
        const matchingFiles = files.filter(file => 
            file.toLowerCase().endsWith(`.${options.fromExt.toLowerCase()}`)
        );
        
        if (matchingFiles.length === 0) {
            console.log(`No files found with extension .${options.fromExt}`);
            return;
        }

        // Sort files for consistent ordering
        matchingFiles.sort();

        // Preview or rename files
        console.log(`Found ${matchingFiles.length} files to process`);
        
        for (const file of matchingFiles) {
            const oldPath = path.join(options.directory, file);
            const newPath = path.join(options.directory, 
                file.slice(0, -(options.fromExt.length + 1)) + '.' + options.toExt);
            
            if (options.preview) {
                console.log(`Would rename: ${file} -> ${path.basename(newPath)}`);
            } else {
                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`Renamed: ${file} -> ${path.basename(newPath)}`);
                } catch (err) {
                    console.error(`Error renaming ${file}:`, err.message);
                }
            }
        }

        if (!options.preview) {
            console.log('\nFile renaming completed!');
        } else {
            console.log('\nPreview mode - no files were renamed');
        }
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

// Execute the function
renameFiles();

