import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList,Platform } from 'react-native';
import { getDatabase, ref, onValue,remove,get,set,onChildChanged} from 'firebase/database';
import Task from '../components/Task';
import { useFocusEffect } from '@react-navigation/native';

export default function DashboardScreen({ route, navigation }) {
  var loadTasks;
  const [tasks, setTasks] = useState([]);
  // role and userId are passed through route params
  const { role, userId } = route.params; 
  const database = getDatabase();
  useFocusEffect(
    React.useCallback(() => {
      if(loadTasks!=undefined)
      {
        loadTasks();
      }
     
    }, [navigation])
  );

  useEffect(() => {
    // Fetch tasks based on user role
     loadTasks = async () => {
      setTasks([]); 
      let tasksRef;
      tasksRef = ref(database, `/users/${userId}/assignedTasks`);
      
      onValue(tasksRef, (snapshot) => {
        //get keys from this tasksData array as they are tasks unique ids
        const tasksData = snapshot.val();
        
        if (tasksData) {
          let tasksObjects = [];
  
          tasksData.forEach((taskId) => {
            const taskRef = ref(database, `/tasks/${taskId}`);
            onValue(taskRef, (taskSnapshot) => {
              const taskObject = taskSnapshot.val();
              tasksObjects.push(taskObject);
              if (tasksObjects.length === tasksData.length) {
                setTasks(tasksObjects);
              }
            });
          });
        } else {
          // No tasks available then assign empty array
          setTasks([]); 
        }
      });
    };
    loadTasks();

    // Listen for task updates (onChildChanged)
    onChildChanged(ref(database, `/tasks`), (changedSnapshot) => {
      
      setTasks([]); 
      loadTasks();
      
    });
 

  
  }, [role, userId]);

  
  const handleAddTask = () => {
    navigation.navigate('AddTask', { role,userId });
  };

  const deleteTask = async (taskId) => {
    try {
     
      const db = getDatabase();
  
      // Delete task from /tasks/{taskId}
      const taskRef = ref(db, `tasks/${taskId}`);
      await remove(taskRef);
  
      const usersRef = ref(db, 'users');
      const promises = [];
      await get(usersRef).then((snapshot) => {
        snapshot.forEach((user) => {
          const assignedTasksRef = ref(db, `users/${user.key}/assignedTasks`);
          const assignedTasks = user.val().assignedTasks;
        
      
          const updatedAssignedTasks = assignedTasks.filter((task) => task!== taskId);
          promises.push(set(assignedTasksRef, updatedAssignedTasks));
        });
      });
      await Promise.all(promises);
    } catch (error) {
      console.log('Error deleting task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {

   
    const updatedTasks = tasks.filter(task => task.taskId !== taskId); 
    setTasks(updatedTasks);
    await deleteTask(taskId);
  

  };

  const handleCompleteTask = async (taskId) => {
   
    const updatedTasks = tasks.map(task => 
      task.taskId === taskId ? { ...task, completed: true } : task
    );
    setTasks(updatedTasks);
    const taskRef = ref(database, `/tasks/${taskId}/completed`);
    await set(taskRef, true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{role} Dashboard</Text>
      
      {role === 'Admin' && (
        <>
          <Button title="Add Task" onPress={handleAddTask} />
          <Text style={styles.subHeader}>Assigned Tasks:</Text>
        </>
      )}

      <FlatList
        data={tasks}
        key={tasks.keys}
        renderItem={({ item }) => (
          <Task 
            task={item} 
            role={role} 
            onEdit={()=>navigation.navigate('EditTask',{task:item})} 
            onDelete={()=>handleDeleteTask(item.taskId)} 
            onComplete={()=>handleCompleteTask(item.taskId)} 
          />
        )}   
        
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
});
