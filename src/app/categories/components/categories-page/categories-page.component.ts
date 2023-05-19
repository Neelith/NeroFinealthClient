import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from 'src/app/generic/table/table.component';
import { PageTitleBarComponent } from 'src/app/page-title-bar/page-title-bar.component';
import { Category } from 'src/app/entities/model/Category';
import { Observable } from 'rxjs';
import { CategoryRepositoryService } from '../../services/category-repository/category-repository.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormControlDescriptor } from 'src/app/entities/dto/FormControlDescriptor';
import { IconService } from 'src/app/services/icon/icon.service';
import { CuFormComponent } from 'src/app/generic/cu-form/cu-form.component';
import { MatDialog } from '@angular/material/dialog';
import { DDialogComponent } from 'src/app/generic/d-dialog/d-dialog.component';
import { NotificationService } from 'src/app/services/notification/notification.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  providers: [CategoryRepositoryService, IconService, NotificationService],
  templateUrl: './categories-page.component.html',
  styleUrls: ['./categories-page.component.scss'],
  imports: [
    CommonModule,
    TableComponent,
    PageTitleBarComponent,
    CuFormComponent,
  ],
})
export class CategoriesPageComponent {
  pageTitle: string = 'Categorie';
  categories$: Observable<Category[]> = this.categoryRepository.getAll();
  displayedColumns: string[] = ['entityImg', 'name', 'actions'];
  addFormControlDescriptors: FormControlDescriptor[] = [];
  addFormEnabled: boolean = false;
  editFormControlDescriptors: FormControlDescriptor[] = [];
  editFormEnabled: boolean = false;
  iconUrls: string[] = this.iconService.getIconUrls();

  constructor(
    private categoryRepository: CategoryRepositoryService,
    private iconService: IconService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {}

  showAddCategoryForm() {
    this.addFormControlDescriptors = [
      {
        formControlName: 'name',
        formControl: new FormControl('', [
          Validators.required,
          Validators.maxLength(100),
        ]),
        hidden: false,
        label: 'Nome',
      },
      {
        formControlName: 'iconUrl',
        formControl: new FormControl('', [Validators.required]),
        hidden: false,
        label: 'Icona',
      },
    ];

    this.addFormEnabled = true;
  }

  addCategory(form: FormGroup) {
    this.addFormEnabled = false;

    if (form.valid) {
      let category: Category = new Category();
      category.name = form.value.name;
      category.iconUrl = form.value.iconUrl;
      this.categoryRepository.add(category).subscribe();
      this.notificationService.notifySuccess(
        'Categoria aggiunta con successo!'
      );
    } else {
      this.notificationService.notifyFailure('Qualcosa è andato storto!');
    }

    this.categories$ = this.categoryRepository.getAll();
  }

  showEditCategoryForm(category: Category) {
    this.editFormControlDescriptors = [
      {
        formControlName: 'categoryId',
        formControl: new FormControl({
          value: category.categoryId,
          disabled: true,
        }),
        hidden: true,
        label: 'Categoria',
      },
      {
        formControlName: 'name',
        formControl: new FormControl(category.name, [
          Validators.required,
          Validators.maxLength(100),
        ]),
        hidden: false,
        label: 'Nome',
      },
      {
        formControlName: 'iconUrl',
        formControl: new FormControl(category.iconUrl, [Validators.required]),
        hidden: false,
        label: 'Icona',
      },
    ];

    this.editFormEnabled = true;
  }

  editCategory(form: FormGroup) {
    this.editFormEnabled = false;

    if (form.valid) {
      let category: Category = {
        categoryId: form.value.categoryId,
        name: form.value.name,
        iconUrl: form.value.iconUrl,
      };
      this.categoryRepository.edit(category).subscribe();
      this.notificationService.notifySuccess(
        'Categoria modificata con successo!'
      );
    } else {
      this.notificationService.notifyFailure('Qualcosa è andato storto!');
    }

    this.categories$ = this.categoryRepository.getAll();
  }

  deleteCategory(category: Category) {
    this.dialog
      .open(DDialogComponent)
      .afterClosed()
      .subscribe((result) => {
        if (result === true) {
          this.categoryRepository.delete(category.categoryId).subscribe();
          this.categories$ = this.categoryRepository.getAll();
          this.notificationService.notifySuccess(
            'Categoria eliminata con successo!'
          );
        } else {
          this.notificationService.notifyFailure('Operazione annullata.');
        }
      });
  }

  onCancelEditForm() {
    this.editFormEnabled = false;
    this.notificationService.notifyFailure('Operazione annullata.');
  }

  onCancelAddForm() {
    this.addFormEnabled = false;
    this.notificationService.notifyFailure('Operazione annullata.');
  }

  showTable() {
    return !this.editFormEnabled && !this.addFormEnabled;
  }
}
