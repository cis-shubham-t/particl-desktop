import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Category } from 'app/core/market/api/category/category.model';
import { ItemNode } from 'app/core-ui/material/tree-with-search/model/item-node';

@Injectable({
  providedIn: 'root'
})
export class ChecklistDatabaseService {

  dataChange: BehaviorSubject<ItemNode[]> = new BehaviorSubject<ItemNode[]>([]);
  treeData: any;
  get data(): ItemNode[] { return this.dataChange.value; }

  constructor() { }

  initialize(TREE_DATA: Category[]) {

    this.treeData = TREE_DATA;
    // Build the tree nodes from Json object. The result is a list of `ItemNode` with nested
    // file node as children.
    const data = this.buildCategoryTree(TREE_DATA, 0);

    // Notify the change.
    this.dataChange.next(data);
  }


  buildCategoryTree(categories: Category[], level: number): ItemNode[] {
    return categories.reduce<ItemNode[]>((accumulator, key) => {
      const value = key.subCategoryList;
      const node = new ItemNode();
      node.item = key.name;
      node.id = key.id;

      if (value != null && value.length) {
        if (Array.isArray(value)) {
          node.children = this.buildCategoryTree(value, level + 1);
        }
      }

      return accumulator.concat(node);
    }, [])
  }

  /** Add an item to to-do list */
  insertItem(parent: ItemNode, name: string) {
    if (parent.children) {
      parent.children.push({ item: name } as ItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: ItemNode, name: string) {
    node.item = name;
    this.dataChange.next(this.data);
  }

  public filter(filterText: string) {
    let filteredTreeData;
    if (filterText) {
      filteredTreeData = this.treeData.map(d => {
        if (d.name.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1) {
          return d;
        }
        d.subCategoryList = d.subCategoryList.filter((sd) => {
          return (sd.name.toLocaleLowerCase().indexOf(filterText.toLocaleLowerCase()) > -1);
        })

        return d;
      }).filter((d) => (d.subCategoryList.length));

    } else {

      filteredTreeData = this.treeData;
    }

    // Build the tree nodes from Json object. The result is a list of `ItemNode` with nested
    // file node as children.
    const data = this.buildCategoryTree(filteredTreeData, 0);
    // Notify the change.
    this.dataChange.next(data);
  }

}
