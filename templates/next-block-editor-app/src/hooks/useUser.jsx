import {useFileInfo} from "@/hooks/useFileInfo";

const colors = ['#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8', '#94FADB', '#B9F18D']
const getRandomElement = list => list[Math.floor(Math.random() * list.length)]
const getRandomColor = () => getRandomElement(colors)
export const userColor = getRandomColor()
export const useUser = () => {
  const { data: fileInfo} = useFileInfo();
  const userName = fileInfo?.user?.name_first + ' ' + fileInfo?.user?.name_last;
  return {
    id: fileInfo?.user?.id,
    name: userName,
    color: userColor,
    room: fileInfo?.file_id,
    file: fileInfo
  }
}
