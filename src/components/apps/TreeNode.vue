<template>
  <div class="tree-item">
    <div 
      class="tree-node" 
      :style="{ paddingLeft: `${level * 16}px` }"
      @click="handleClick"
      @contextmenu.prevent="showContextMenu"
      :class="{ selected: selectedPath === path }"
    >
      <span class="icon">{{ item.type === 'folder' ? (isExpanded ? '📂' : '📁') : '📄' }}</span>
      <span class="name">{{ name }}</span>
    </div>
    <div v-if="item.type === 'folder' && isExpanded && item.children" class="tree-children">
      <TreeNode 
        v-for="(child, childName) in item.children" 
        :key="childName"
        :name="childName"
        :item="child"
        :path="`${path}\\${childName}`"
        :level="level + 1"
        :selected-path="selectedPath"
        :expanded-folders="expandedFolders"
        @toggle="$emit('toggle', $event)"
        @select="$emit('select', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
    <div v-if="contextMenuVisible" class="context-menu" :style="contextMenuStyle">
      <div class="menu-item" @click="handleDelete">Delete</div>
      <div class="menu-item" @click="closeContextMenu">Cancel</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  name: String,
  item: Object,
  path: String,
  level: Number,
  selectedPath: String,
  expandedFolders: Set
})

const emit = defineEmits(['toggle', 'select', 'delete'])

const contextMenuVisible = ref(false)
const contextMenuStyle = ref({})

const isExpanded = computed(() => props.expandedFolders.has(props.path))

const handleClick = () => {
  if (props.item.type === 'folder') {
    emit('toggle', props.path)
  } else {
    emit('select', props.path)
  }
}

const showContextMenu = (event) => {
  if (props.item.type === 'file') {
    contextMenuVisible.value = true
    contextMenuStyle.value = {
      position: 'fixed',
      left: `${event.clientX}px`,
      top: `${event.clientY}px`
    }
  }
}

const closeContextMenu = () => {
  contextMenuVisible.value = false
}

const handleDelete = () => {
  emit('delete', props.path)
  closeContextMenu()
}
</script>

<style scoped>
.tree-item {
  position: relative;
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

.context-menu {
  background: #c0c0c0;
  border: 2px outset #dfdfdf;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  z-index: 10000;
  min-width: 120px;
}

.menu-item {
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;
}

.menu-item:hover {
  background: #000080;
  color: white;
}
</style>
