import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AgGridModule } from 'ag-grid-angular';
import { RouterModule } from '@angular/router';
import {MatChipsModule} from '@angular/material/chips';



@NgModule({
  declarations: [],
  // imports: [
  //   // CommonModule,
  //   // HttpClientModule,
  //   // FormsModule,
  //   // ReactiveFormsModule,
  //   // MatToolbarModule,
  //   // MatButtonModule,
  //   // MatIconModule,
  //   // MatCardModule,
  //   // MatExpansionModule,
  //   // MatProgressSpinnerModule,
  //   // MatSnackBarModule,
  //   // MatSelectModule,
  //   // MatFormFieldModule,
  //   // MatInputModule,
  //   // AgGridModule,
  //   // RouterModule,
  //   // MatChipsModule
  // ],
  exports : [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    AgGridModule,
    RouterModule,
    MatChipsModule
  ]
})
export class SharedModule { }
