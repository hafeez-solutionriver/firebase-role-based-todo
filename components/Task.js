import React,{useState} from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Task({ task, role, onEdit, onDelete, onComplete }) {
 
  const [isCompeleted,setIsCompleted] = useState(task.completed);
 
  return (
    <View style={styles.taskContainer}>
      <Text style={styles.title}>{task.title}</Text>
      <Text>Description: {task.description}</Text>
      <Text>Due Date: {task.dueDate}</Text>
      <Text>Priority: {task.priority}</Text>
      <Text>Status: {isCompeleted?'Completed':'Pending'}</Text>
      {role === 'Admin' && (
        <>
          <Button title="Edit Task"  style={styles.editTaskBtn} onPress={() => onEdit(task.id)} />
          <Button title="Delete Task" onPress={() => onDelete(task.id)} />
         
        </>
      )}
      {role==='Member' ? (
        <Button title={isCompeleted?"Completed":"Mark as Complete"} disabled={isCompeleted} onPress= {()=>{setIsCompleted(true); onComplete(task.id)}} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  taskContainer: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
 
});
