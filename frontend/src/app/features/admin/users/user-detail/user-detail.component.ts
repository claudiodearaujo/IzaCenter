import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SkeletonModule } from 'primeng/skeleton';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UsersService, User } from '../../../../core/services/users.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CurrencyBrlPipe } from '../../../../shared/pipes/currency-brl.pipe';
import { DsAvatarComponent, DsBadgeComponent, DsButtonComponent, DsCardComponent, DsEmptyStateComponent } from '../../../../shared/design-system';

interface UserDetail extends User { orders?: any[]; readings?: any[]; }

@Component({
  selector:'app-user-detail',
  standalone:true,
  imports:[CommonModule,RouterLink,FormsModule,SkeletonModule,Tabs,TabList,Tab,TabPanels,TabPanel,ConfirmDialogModule,CurrencyBrlPipe,TranslateModule,DsAvatarComponent,DsBadgeComponent,DsButtonComponent,DsCardComponent,DsEmptyStateComponent],
  providers:[ConfirmationService],
  templateUrl:'./user-detail.component.html',
  styleUrl:'./user-detail.component.css',
})
export class UserDetailComponent implements OnInit {
  private usersService=inject(UsersService);
  private route=inject(ActivatedRoute);
  private notification=inject(NotificationService);
  private confirmationService=inject(ConfirmationService);
  private translate=inject(TranslateService);
  user=signal<UserDetail|null>(null); loading=signal(true); saving=signal(false);

  ngOnInit():void{const id=this.route.snapshot.paramMap.get('id'); if(id)this.loadUser(id);}
  loadUser(id:string):void{this.loading.set(true);this.usersService.findById(id).subscribe({next:r=>{this.user.set(r.data as UserDetail);this.loading.set(false)},error:()=>{this.notification.error(this.translate.instant('admin.users.errorLoadingUser'));this.loading.set(false)}})}
  getRoleTone(role:string):'brand'|'warning'{return role==='ADMIN'?'warning':'brand'}
  getRoleLabel(role:string):string{return role==='ADMIN'?this.translate.instant('admin.users.roleAdmin'):this.translate.instant('admin.users.roleClient')}
  formatDate(v?:string|Date):string{return v?new Date(v).toLocaleDateString('pt-BR'):this.translate.instant('admin.users.notInformed')}
  formatDateTime(v:string|Date):string{return new Date(v).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
  toggleRole():void{if(!this.user())return;const role=this.user()!.role==='ADMIN'?'CLIENT':'ADMIN';const label=this.getRoleLabel(role);this.confirmationService.confirm({message:this.translate.instant('admin.users.confirmRoleChange',{role:label}),header:this.translate.instant('admin.users.confirmChange'),icon:'pi pi-exclamation-triangle',accept:()=>this.usersService.updateRole(this.user()!.id,role).subscribe({next:()=>{this.user.update(u=>u?{...u,role:role as 'ADMIN'|'CLIENT'}:null);this.notification.success(this.translate.instant('admin.users.roleUpdated'))},error:()=>this.notification.error(this.translate.instant('admin.users.errorUpdatingRole'))})})}
  toggleActive():void{if(!this.user())return;const active=!this.user()!.isActive;const action=active?this.translate.instant('admin.users.activate'):this.translate.instant('admin.users.deactivate');const msg=active?this.translate.instant('admin.users.userActivated'):this.translate.instant('admin.users.userDeactivated');this.confirmationService.confirm({message:this.translate.instant('admin.users.confirmStatusChange',{action}),header:this.translate.instant('admin.users.confirmChange'),icon:'pi pi-exclamation-triangle',accept:()=>this.usersService.update(this.user()!.id,{isActive:active} as any).subscribe({next:()=>{this.user.update(u=>u?{...u,isActive:active}:null);this.notification.success(msg)},error:()=>this.notification.error(this.translate.instant('admin.users.errorUpdatingStatus'))})})}
}
