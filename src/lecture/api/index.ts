import axios from 'axios';
import { Lecture } from '../../types';

export const fetchMajors = () => axios.get<Lecture[]>('/schedules-majors.json');
export const fetchLiberalArts = () => axios.get<Lecture[]>('/schedules-liberal-arts.json');
