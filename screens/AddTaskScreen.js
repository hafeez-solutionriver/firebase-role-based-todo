import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,ScrollView,Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDatabase, ref, get, push, update,set } from 'firebase/database';

export default function AddTaskScreen({ route, navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('Low');
  const [assignedUser, setAssignedUser] = useState('');
  const [users, setUsers] = useState([]);
  
  const { userId } = route.params; // Admin userId from route params
  
  useEffect(() => {
    const fetchUsers = async () => {
      const db = getDatabase();
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        // Filter only users with the role "Member"
        const members = Object.keys(usersData).map((key) => ({
          id: key,
          ...usersData[key],
        })).filter(user => user.role === 'Member');
        
        if(members.length>0)
        {
          setAssignedUser(members[0].id)
        }
        setUsers(members);
      }
    };
    fetchUsers();
  }, []);

 // Function to add taskId to user's assignedTasks array
const addTaskToUser = async (userId, taskId) => {
  const db = getDatabase();
  const userRef = ref(db, `users/${userId}/assignedTasks`);
  const snapshot = await get(userRef);
  let currentTasks = [];
  if (snapshot.exists()) {
    currentTasks = snapshot.val(); // Get current assignedTasks array
  }

  // Add the new taskId to the array if it doesn't already exist
  const updatedTasks = [...currentTasks, taskId];

  // Update the user's assignedTasks with the new array
  await update(ref(db, `users/${userId}`), { assignedTasks: updatedTasks });
};

// In your handleAddTask function
const handleAddTask = async () => {
 
  if (!title || !description || !assignedUser) {
    Alert.alert('Error', 'Please fill all fields and assign the task.');
    return;
  }

  try {
    const db = getDatabase();
    const taskRef = push(ref(db, 'tasks')); // Push new task into 'tasks' node
    const taskId = taskRef.key;
    
    const newTask = {
      title,
      description,
      dueDate: dueDate.toDateString(),
      priority,
      assignedTo: assignedUser,
      completed: false,
      assignedBy: userId,
      taskId:taskId
    };
   
    
    // Add task to 'tasks' node
    await set(ref(db, `tasks/${taskId}`), newTask);

    // Add taskId to assigned user's assignedTasks array
    await addTaskToUser(assignedUser, taskId);

    // Add taskId to the admin's assignedTasks array
    await addTaskToUser(userId, taskId);

    Alert.alert('Success', 'Task added successfully');
    navigation.goBack(); // Navigate back after adding the task
  } catch (error) {
   
    Alert.alert('Error', 'Something went wrong while adding the task');
  }
};

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(false);
    setDueDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add Task</Text>
      <ScrollView>
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
        style={styles.inputPicker}
        onValueChange={(itemValue) => setPriority(itemValue)}
      >
        <Picker.Item label="Low" value="Low" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="High" value="High" />
      </Picker>
      <Text style={styles.label}>Assign Task To</Text>
      <Picker
        selectedValue={assignedUser}
        style={styles.inputPicker}
        onValueChange={(itemValue) => setAssignedUser(itemValue)}
      >
        {users.map((user) => (
          <Picker.Item key={user.id} label={user.name} value={user.id} />
        ))}
      </Picker>
      <Button title="Add Task" onPress={handleAddTask} />
      </ScrollView>
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
  inputPicker: {
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
