import { useStudy } from '../context/StudyContext';

export const useSubjects = () => {
  const { subjects, addSubject, updateSubject, deleteSubject, addTopic, updateTopic, deleteTopic } = useStudy();
  
  return { subjects, addSubject, updateSubject, deleteSubject, addTopic, updateTopic, deleteTopic };
};
