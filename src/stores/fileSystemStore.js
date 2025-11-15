import { defineStore } from 'pinia'
import geminiService from '../utils/geminiService'

export const useFileSystemStore = defineStore('fileSystem', {
  state: () => ({
    fileTree: {},
    generatedFolders: new Set(),
    fileContents: new Map()
  }),
  
  actions: {
    async lazyLoadFolder(folderPath) {
      // Check if folder has already been generated
      if (this.generatedFolders.has(folderPath)) {
        return this.fileTree[folderPath] || []
      }
      
      try {
        // Build prompt for generating unsettling filenames
        const prompt = `Generate exactly 5 filenames for a Windows 95 folder belonging to a missing person. 
The folder path is: ${folderPath}

Make the filenames sound mundane but unsettling (e.g., "evidence.jpg", "dont_open.txt", "last_message.doc", "recording_032.wav").
Use realistic Windows 95 file extensions: .txt, .doc, .jpg, .bmp, .wav, .avi, .exe, .dll
Mix file types to make it feel authentic.

Return ONLY the filenames, one per line, with no numbering, bullets, or extra text.`

        const response = await geminiService.chat(prompt)
        
        // Parse response to extract filenames
        const filenames = response
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.match(/^\d+\./) && line.includes('.'))
          .slice(0, 5) // Ensure we only take 5 files
        
        // Create file objects
        const files = filenames.map(name => ({
          name,
          type: 'file',
          path: `${folderPath}\\${name}`
        }))
        
        // Store in fileTree
        this.fileTree[folderPath] = files
        
        // Mark folder as generated
        this.generatedFolders.add(folderPath)
        
        return files
      } catch (error) {
        console.error('Failed to generate folder contents:', error)
        
        // Fallback to generic unsettling filenames
        const fallbackFiles = [
          'untitled.txt',
          'backup.doc',
          'photo.jpg',
          'notes.txt',
          'data.dat'
        ].map(name => ({
          name,
          type: 'file',
          path: `${folderPath}\\${name}`
        }))
        
        this.fileTree[folderPath] = fallbackFiles
        this.generatedFolders.add(folderPath)
        
        return fallbackFiles
      }
    },

    async generateFileContent(filename, filepath) {
      // Check cache first
      if (this.fileContents.has(filepath)) {
        return this.fileContents.get(filepath)
      }
      
      try {
        // Build prompt using filename as context
        const prompt = `You are generating the content of a file named "${filename}" found on a missing person's computer in Windows 95.

Write 2-3 paragraphs of unsettling but realistic content that matches the filename.
Make it feel like a real document someone would have on their computer.
Be subtle and eerie - don't be overly dramatic or explicit.
Use appropriate formatting for the file type (plain text, no markdown).

Content:`

        const content = await geminiService.chat(prompt)
        
        // Cache the generated content
        this.fileContents.set(filepath, content)
        
        return content
      } catch (error) {
        console.error('Failed to generate file content:', error)
        
        // Fallback content
        const fallbackContent = `This file appears to be corrupted or unreadable.
        
Last modified: [DATE UNKNOWN]
        
The contents of this file cannot be displayed properly. Some data may have been lost or corrupted during the last system shutdown.`
        
        this.fileContents.set(filepath, fallbackContent)
        return fallbackContent
      }
    },
    
    clearCache() {
      this.fileContents.clear()
    },
    
    resetGeneratedFolders() {
      this.generatedFolders.clear()
      this.fileTree = {}
    }
  }
})
