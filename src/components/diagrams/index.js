import BubbleSortDiagram from './BubbleSortDiagram'
import InsertionSortDiagram from './InsertionSortDiagram'
import SelectionSortDiagram from './SelectionSortDiagram'
import QuickSortDiagram from './QuickSortDiagram'
import BinarySearchDiagram from './BinarySearchDiagram'
import HashChainingDiagram from './HashChainingDiagram'
import BstInsertDiagram from './BstInsertDiagram'
import BfsDiagram from './BfsDiagram'
import DfsDiagram from './DfsDiagram'
import ErDiagramExample from './ErDiagramExample'

export const diagrams = {
  'Пузырьковая сортировка': BubbleSortDiagram,
  'Сортировка вставкой': InsertionSortDiagram,
  'Сортировка выбором': SelectionSortDiagram,
  'Быстрая сортировка': QuickSortDiagram,
  'Двоичный поиск': BinarySearchDiagram,
  'Разрешение коллизий: отдельная цепочка': HashChainingDiagram,
  'BST (двоичное дерево поиска)': BstInsertDiagram,
  'Поиск в ширину (BFS)': BfsDiagram,
  'Поиск в глубину (DFS)': DfsDiagram,
  'Элементы ER-диаграммы': ErDiagramExample,
}
