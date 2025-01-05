export interface Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resourceId?: string;
}

const events: Event[] = [
  {
    id: 0,
    title: 'Project Kickoff',
    start: new Date(2024, 0, 15, 10, 0),
    end: new Date(2024, 0, 15, 12, 30),
  },
  {
    id: 1,
    title: 'Team Meeting',
    start: new Date(2024, 0, 16, 14, 0),
    end: new Date(2024, 0, 16, 15, 0),
  },
  {
    id: 2,
    title: 'Sprint Planning',
    start: new Date(2024, 0, 17, 9, 0),
    end: new Date(2024, 0, 17, 11, 0),
  },
  {
    id: 3,
    title: 'Design Review',
    start: new Date(2024, 0, 18, 13, 0),
    end: new Date(2024, 0, 18, 14, 30),
  },
  {
    id: 4,
    title: 'Code Review',
    start: new Date(2024, 0, 19, 15, 0),
    end: new Date(2024, 0, 19, 16, 0),
  }
];

export default events; 