<template>
  <div class="my-computer">
    <div class="toolbar">
      <button class="btn">File</button>
      <button class="btn">Edit</button>
      <button class="btn">View</button>
      <button class="btn">Help</button>
    </div>
    <div class="file-explorer">
      <div class="tree-view">
        <div v-for="(item, path) in fileTree" :key="path" class="tree-item">
          <div 
            class="tree-node" 
            @click="toggleFolder(path)"
            :class="{ selected: selectedPath === path }"
          >
            <span class="icon">{{ item.type === 'folder' ? (expandedFolders.has(path) ? '📂' : '📁') : '📄' }}</span>
            <span class="name">{{ path }}</span>
          </div>
          <div v-if="item.type === 'folder' && expandedFolders.has(path)" class="tree-children">
            <TreeNode 
              v-for="(child, childName) in item.children" 
              :key="childName"
              :name="childName"
              :item="child"
              :path="`${path}\\${childName}`"
              :level="1"
              :selected-path="selectedPath"
              :expanded-folders="expandedFolders"
              @toggle="toggleFolder"
              @select="selectItem"
              @delete="deleteFile"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="status-bar">
      <span v-if="isLoading">Loading...</span>
      <span v-else>{{ selectedPath || 'My Computer' }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import TreeNode from './TreeNode.vue'
import { useFileSystemStore } from '../../stores/fileSystemStore'
import { useWindowManagerStore } from '../../stores/windowManager'
import { gameplayService } from '../../utils/gameplayService'
import { metaHorrorService } from '../../utils/metaHorrorService'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

const fileSystemStore = useFileSystemStore()
const windowManager = useWindowManagerStore()

const selectedPath = ref('')
const expandedFolders = reactive(new Set())
const isLoading = ref(false)

const fileTree = reactive({
  'C:\\': {
    type: 'folder',
    children: {
      'Windows': {
        type: 'folder',
        children: {
          'System32': { type: 'folder', children: {} }
        }
      },
      'Program Files': {
        type: 'folder',
        children: {
          'Necro-OS': {
            type: 'folder',
            children: {
              'necro.exe': { type: 'file' }
            }
          }
        }
      },
      'My Documents': {
        type: 'folder',
        children: {
          'secrets.txt': { type: 'file' },
          'diary.txt': { type: 'file' },
          'passwords.txt': { type: 'file' }
        }
      },
      'Cursed': {
        type: 'folder',
        children: {} // Will be populated with cursed files
      },
      'YOUR_SECRETS.txt': { 
        type: 'file',
        isHidden: true
      },
      'WATCHING_YOU.log': { 
        type: 'file',
        isHidden: true
      }
    }
  }
})

const toggleFolder = async (path) => {
  // Check if folder is being collapsed
  if (expandedFolders.has(path)) {
    expandedFolders.delete(path)
    selectedPath.value = path
    return
  }
  
  // Expanding folder - check if it's empty and needs lazy loading
  const folder = findFolderByPath(path)
  
  if (folder && folder.type === 'folder') {
    // Check if folder has no children or empty children object
    const hasNoChildren = !folder.children || Object.keys(folder.children).length === 0
    
    if (hasNoChildren) {
      // Special handling for Cursed folder
      if (path === 'C:\\Cursed') {
        isLoading.value = true
        try {
          // Get cursed files from gameplay service
          const cursedFiles = gameplayService.getCursedFileList()
          
          // Populate Cursed folder with cursed files
          folder.children = {}
          cursedFiles.forEach(file => {
            folder.children[file.name] = { 
              type: 'file',
              isCursed: true,
              cursedFileId: file.id
            }
          })
          
          console.log(`[MyComputer] Loaded ${cursedFiles.length} cursed files`)
        } catch (error) {
          console.error('Failed to load cursed files:', error)
        } finally {
          isLoading.value = false
        }
      } else {
        // Trigger lazy loading for other folders
        isLoading.value = true
        try {
          const generatedFiles = await fileSystemStore.lazyLoadFolder(path)
          
          // Update local file tree with generated files
          if (generatedFiles && generatedFiles.length > 0) {
            folder.children = {}
            generatedFiles.forEach(file => {
              folder.children[file.name] = { type: 'file' }
            })
          }
        } catch (error) {
          console.error('Failed to load folder:', error)
        } finally {
          isLoading.value = false
        }
      }
    }
    
    expandedFolders.add(path)
  }
  
  selectedPath.value = path
}

const selectItem = async (path) => {
  selectedPath.value = path
  
  // Check if this is a file that should be opened
  const item = findItemByPath(path)
  if (item && item.type === 'file') {
    await openFile(path)
  }
}

const findFolderByPath = (path) => {
  const pathParts = path.split('\\').filter(p => p)
  let current = fileTree
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i]
    if (i === 0) {
      current = current[part + '\\']
    } else {
      current = current.children?.[part]
    }
    if (!current) return null
  }
  
  return current
}

const findItemByPath = (path) => {
  const pathParts = path.split('\\').filter(p => p)
  let current = fileTree
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i]
    if (i === 0) {
      current = current[part + '\\']
    } else {
      current = current.children?.[part]
    }
    if (!current) return null
  }
  
  return current
}

const openFile = async (path) => {
  const fileName = path.split('\\').pop()
  
  // Only open .txt and .log files in Notepad
  if (fileName.endsWith('.txt') || fileName.endsWith('.log')) {
    isLoading.value = true
    try {
      let content
      
      // Check if this is a hidden file with cryptic content
      if (fileName === 'YOUR_SECRETS.txt' || fileName === 'WATCHING_YOU.log') {
        content = metaHorrorService.generateHiddenFileContent(fileName)
        console.log(`[MyComputer] Opened hidden file: ${fileName}`)
      } else {
        // Generate file content dynamically for regular files
        content = await fileSystemStore.generateFileContent(fileName, path)
      }
      
      // Open Notepad window with generated content
      windowManager.openWindow('notepad', {
        title: `Notepad - ${fileName}`,
        data: {
          filename: fileName,
          content: content,
          filepath: path
        }
      })
    } catch (error) {
      console.error('Failed to open file:', error)
    } finally {
      isLoading.value = false
    }
  }
}

const deleteFile = (path) => {
  // Find and remove the file from the tree
  const pathParts = path.split('\\').filter(p => p)
  let current = fileTree
  
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i]
    if (i === 0) {
      current = current[part + '\\']
    } else {
      current = current.children?.[part]
    }
    if (!current) return
  }
  
  const fileName = pathParts[pathParts.length - 1]
  if (current.children && current.children[fileName]) {
    const fileNode = current.children[fileName]
    
    // Check if this is a cursed file
    if (fileNode.isCursed && fileNode.cursedFileId) {
      // Perform file exorcism through gameplay service
      const success = gameplayService.performFileExorcism(fileNode.cursedFileId)
      
      if (success) {
        // Remove from UI
        delete current.children[fileName]
        selectedPath.value = ''
        console.log(`[MyComputer] Cursed file deleted: ${fileName}`)
      } else {
        console.log(`[MyComputer] Failed to delete cursed file (cooldown active)`)
      }
    } else {
      // Regular file deletion
      delete current.children[fileName]
      selectedPath.value = ''
      
      // Emit event for recycle bin integration (will be used by ghost behaviors)
      window.dispatchEvent(new CustomEvent('file-deleted', { 
        detail: { path, name: fileName } 
      }))
    }
  }
}

// Listen for cursed file deletion events to refresh the folder
const handleCursedFileDeleted = () => {
  // Refresh the Cursed folder if it's expanded
  if (expandedFolders.has('C:\\Cursed')) {
    const cursedFolder = findFolderByPath('C:\\Cursed')
    if (cursedFolder) {
      // Reload cursed files
      const cursedFiles = gameplayService.getCursedFileList()
      cursedFolder.children = {}
      cursedFiles.forEach(file => {
        cursedFolder.children[file.name] = { 
          type: 'file',
          isCursed: true,
          cursedFileId: file.id
        }
      })
    }
  }
}

onMounted(() => {
  window.addEventListener('cursed-file-deleted', handleCursedFileDeleted)
})

onUnmounted(() => {
  window.removeEventListener('cursed-file-deleted', handleCursedFileDeleted)
})
</script>

<style scoped>
.my-computer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  font-family: 'MS Sans Serif', sans-serif;
}

.toolbar {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
}

.toolbar .btn {
  padding: 2px 8px;
  font-size: 11px;
}

.file-explorer {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.tree-view {
  font-size: 12px;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 2px 4px;
  cursor: pointer;
  user-select: none;
}

.tree-node:hover {
  background: #e0e0e0;
}

.tree-node.selected {
  background: #000080;
  color: white;
}

.tree-node .icon {
  margin-right: 4px;
  font-size: 14px;
}

.tree-node .name {
  font-size: 11px;
}

.tree-children {
  margin-left: 16px;
}

.status-bar {
  padding: 2px 8px;
  background: #c0c0c0;
  border-top: 1px solid #808080;
  font-size: 11px;
}
</style>
