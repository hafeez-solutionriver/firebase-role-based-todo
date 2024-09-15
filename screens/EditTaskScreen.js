import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabase, ref,set } from 'firebase/database';


export default function EditTaskScreen({ route, navigation }) {
  const { task } = route.params; // taskId and task are passed through route params
  
  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(new Date(task.dueDate) || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState(task.priority || 'Low');

  // Function to handle task update
  const handleUpdateTask = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    const updatedTask = {
      ...task, // Keep existing task details
      title,
      description,
      dueDate: dueDate.toISOString(),
      priority,
    };

    try {
      const db = getDatabase();
      // Update task using taskId
      const taskRef = ref(db, `tasks/${task.taskId}`); 
     
      await set(taskRef, updatedTask);

      Alert.alert('Success', 'Task updated successfully');
      // Navigate back after updating the task
      navigation.goBack(); 
    } catch (error) {
      console.log('Error updating task:', error);
      Alert.alert('Error', 'Something went wrong while updating the task');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Task Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <View>
        <Button title="Select Due Date" onPress={() => setShowDatePicker(true)} />
        <Text style={styles.dateText}>
          Due Date: {dueDate.toDateString()}
        </Text>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}
      </View>
      <Text style={styles.label}>Priority</Text>
      <Picker
        selectedValue={priority}
        style={styles.input}
        onValueChange={(itemValue) => setPriority(itemValue)}
      >
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>
      <Button title="Update Task" onPress={handleUpdateTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
    borderRadius: 4,
  },
  dateText: {
    marginTop: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
});
