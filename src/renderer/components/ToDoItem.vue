<template>
  <div class="todo-item">

    <div class="todo-item-left">
      <input type="checkbox" v-model="todo.completed">
      <div class="todo-item-label" :class="{ 'completed': todo.completed }">{{ todo.title }}</div>
    </div>


    <div class="todo-item-right">
      <button class="btn-item remove" @click="removeTodo(todo.id)">删除</button>
      <button class="btn-item edit" @click="editTodo(todo.id)">编辑</button>
    </div>


  </div>
</template>


<script setup lang="ts">
import eventBus from '../../common/event-bus'
import { alert } from './Alert'

const props = defineProps({
  todo: {
    type: Object,
    required: true
  }
})


async function editTodo(id: any) {
  console.log('id', id)
}


async function removeTodo(id) {
  console.log('id', id);

  let res = await alert({
    type: 'error',
    info: '系统通知'
  })

  if (res) {
    eventBus.emit('removeTodo', id)
  }
}

</script>




<style>
.todo-item {
  background: #f4f4f4;
  padding: 10px;
  border-bottom: 1px #ccc dotted;
  display: flex;
  justify-content: space-between;
}

.todo-item-left {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.todo-item-right {
  display: flex;
  align-items: center;
  justify-content: space-around;
}


.todo-item-label {
  margin-left: 12px;
}

.todo-item-label.completed {
  text-decoration: line-through;
}



.btn-item {
  color: #fff;
  border: none;
  padding: 5px 9px;
  cursor: pointer;
  border-radius: 3px;
  background: #333;
}

.btn-item+.btn-item {
  margin-left: 8px;
}

.btn-item.remove {
  background: #ff0000;
}

.btn-item.remove:hover {
  background: #f44336;
}

.btn-item.edit {
  background: #008ee0;
}

.btn-item.edit:hover {
  background: #2196f3;
}
</style>