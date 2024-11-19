import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { provideComponentStore } from '@ngrx/component-store';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RxLet } from '@rx-angular/template/let';
import { ScheduleStore } from '../data-access/store/schedule.store';
import { MapShiftTypeNamePipe } from '../until/shift.pipe';
import { NzTableDefaultSettingDirective } from 'src/app/share/ui/directive/nz-table-default-setting.directive';
import { PlanDailyUpdateModalComponent } from '../ui/plan-daily-update-modal.component';
import { PlanDailyUpdateModalApi } from '../data-access/model/plan-daily-api.model';
import { tap } from 'rxjs';

@Component({
  selector: 'app-schedule',
  standalone: true,
  providers: [
    NzModalService,
    provideComponentStore(ScheduleStore),
    NzMessageService,
  ],
  template: `
    <nz-breadcrumb>
      <nz-breadcrumb-item>Quản lý lịch làm</nz-breadcrumb-item>
      <nz-breadcrumb-item>Xem và sửa lịch làm</nz-breadcrumb-item>
    </nz-breadcrumb>
    <nz-divider></nz-divider>
    <div nz-row>
      <div nz-col nzSpan="22" class="">
        <nz-input-group nzSearch [nzAddOnAfter]="suffixIconButton">
          <input type="text" nz-input placeholder="Tìm theo tên" />
        </nz-input-group>
        <ng-template #suffixIconButton>
          <button nz-button nzType="primary" nzSearch>
            <span nz-icon nzType="search"></span>
          </button>
        </ng-template>
      </div>
      <div nz-col nzSpan="2" class="tw-text-center">
        <button nz-button nzType="primary" (click)="createPlan()">
          Tạo Lịch làm
        </button>
      </div>
      <!-- <div nz-row class="tw-mt-4 tw-flex"> -->
      <!-- </div> -->
      <div nz-col nzSpan="24" class="tw-mt-5">
        <ng-container *rxLet="vm$ as vm">
          <nz-table
            appNzTableDefaultSetting
            class="tw-mr-4"
            [nzData]="vm.schedulePaging.content"
            [nzTotal]="vm.schedulePaging.totalElement"
            [(nzPageIndex)]="sStore.pagingRequest.current"
            [(nzPageSize)]="sStore.pagingRequest.pageSize"
            (nzQueryParams)="onTableQueryParamsChange($event)"
            [nzShowTotal]="totalText"
            [nzLoading]="!!vm.loadingCount"
            nzShowSizeChanger
          >
            <thead>
              <ng-template #totalText let-total let-range="range">
                <span
                  >{{ range[0] }} - {{ range[1] }} of {{ total }}
                  {{ 'Plans' }}</span
                >
              </ng-template>
              <tr>
                <th>STT</th>
                <th>Tên Kế Hoạch</th>
                <th>Trạng Thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody *ngFor="let data of vm.schedulePaging.content; index as i">
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ data.weeklyPlanName }}</td>
                <td>{{ data.weeklyPlanStatusName }}</td>
                <td class="tw-text-center">
                  <button
                    nz-button
                    nzType="primary"
                    (click)="onActive(data.weeklyPlanId)"
                    *ngIf="data.weeklyPlanStatusCode === 'DRAFT'"
                  >
                    Kích hoạt
                  </button>
                  <button
                    nz-button
                    class="tw-ml-3"
                    nzType="primary"
                    *ngIf="!sStore.pagingExpand.has(data.weeklyPlanId)"
                    (click)="onEditRow(data.weeklyPlanId)"
                  >
                    Chi tiết
                  </button>
                  <button
                    nz-button
                    nzDanger
                    nzType="primary"
                    class="tw-ml-3"
                    *ngIf="sStore.pagingExpand.has(data.weeklyPlanId)"
                    (click)="onClose()"
                  >
                    Đóng
                  </button>
                </td>
              </tr>
              <!-- <tr *ngIf="sStore.pagingExpand.has(data.weeklyPlanId)">
                <td colSpan="17">
                  <div class="tw-flex tw-justify-end">
                    <button
                      nz-button
                      nzDanger
                      nzType="primary"
                      nzSize="small"
                      (click)="onClose()"
                    >
                      Đóng
                    </button>
                  </div>
                </td>
              </tr> -->
              <tr *ngIf="sStore.pagingExpand.has(data.weeklyPlanId)">
                <td colSpan="17">
                  <nz-table
                    appNzTableDefaultSetting
                    [nzData]="
                      vm.planWeeklyDetail.value.dailyPlans
                        ? vm.planWeeklyDetail.value.dailyPlans
                        : []
                    "
                    nzShowPagination="false"
                    class="tw-my-6 tw-mr-6"
                  >
                    <thead>
                      <tr>
                        <th>Thứ</th>
                        <th>Ngày</th>
                        <th>Dịch vụ trong ngày</th>
                        <th nzWidth=""></th>
                      </tr>
                    </thead>
                    <tbody
                      *ngFor="let item of vm.planWeeklyDetail.value.dailyPlans"
                    >
                      <tr>
                        <td>{{ item.dayInWeekName }}</td>
                        <td>{{ item.date }}</td>
                        <td *ngFor="let itemS of vm.planWeeklyDetail.value.dailyPlanServices">{{ itemS.shopServiceName }}</td>
                        <td class="tw-text-center">
                          <button nz-button class="tw-ml-3" nzType="primary">
                            Chỉnh sửa dịch vụ
                          </button>
                          <button
                            nz-button
                            class="tw-ml-3"
                            nzType="primary"
                            *ngIf="
                              !sStore.pagingSubRowExpand.has(item.dailyPlanId)
                            "
                            (click)="onEditSubRow(item.dailyPlanId)"
                          >
                            Chi tiết
                          </button>
                          <button
                            nz-button
                            nzDanger
                            nzType="primary"
                            class="tw-ml-3"
                            *ngIf="
                              sStore.pagingSubRowExpand.has(item.dailyPlanId)
                            "
                            (click)="oncloseSubRow()"
                          >
                            Đóng
                          </button>
                        </td>
                      </tr>
                      <tr
                        *ngIf="sStore.pagingSubRowExpand.has(item.dailyPlanId)"
                      >
                        <td colSpan="17">
                          <nz-table
                            [nzData]="
                              vm.planDaily.value.dailyPlanAccounts
                                ? vm.planDaily.value.dailyPlanAccounts
                                : []
                            "
                            nzShowPagination="false"
                            class="tw-my-6 tw-mr-6"
                          >
                            <thead>
                              <tr>
                                <th>Họ và Tên</th>
                                <th>Số điện thoại</th>
                                <th>Ca làm</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                *ngFor="
                                  let itemDaily of vm.planDaily.value
                                    .dailyPlanAccounts
                                "
                              >
                                <td>{{ itemDaily.fullName }}</td>
                                <td>{{ itemDaily.phone }}</td>
                                <td>{{ itemDaily.shiftName }}</td>
                                <td>
                                  <button
                                    nz-button
                                    nzType="primary"
                                    (click)="
                                      onUpdatePlanDaily(
                                        itemDaily.dailyPlanId,
                                        itemDaily.accountId,
                                        itemDaily.professionalTypeCode,
                                        itemDaily.shiftCode,
                                        itemDaily.shiftName,
                                        itemDaily.fullName
                                      )
                                    "
                                  >
                                    Chỉnh sửa
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </nz-table>
                        </td>
                      </tr>
                    </tbody>
                  </nz-table>
                </td>
              </tr>
            </tbody>
          </nz-table>
        </ng-container>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NzBreadCrumbModule,
    NzDividerModule,
    NzGridModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzTableModule,
    RouterLink,
    NzSelectModule,
    RxLet,
    MapShiftTypeNamePipe,
    NzTableDefaultSettingDirective,
    RouterLink,
  ],
})
export class ScheduleComponent implements OnInit {
  constructor(
    private _nzModalSvc: NzModalService,
    private _fb: NonNullableFormBuilder,
    public sStore: ScheduleStore
  ) {}

  vm$ = this.sStore.state$;
  today = new Date();

  ngOnInit(): void {
    console.log(this.today.toISOString());
  }

  createPlan() {
    this.sStore.createPlan({
      model: { pickupDateReq: this.today.toISOString() },
    });
  }

  onTableQueryParamsChange(params: NzTableQueryParams) {
    const { sort } = params;
    const currentSort = sort.find((item) => item.value !== null);
    this.sStore.pagingRequest.sorter = currentSort?.key ?? '';
    this.sStore.pagingRequest.orderDescending = currentSort?.value !== 'ascend';
    this.sStore.getPlanPaging();
    console.log();
  }

  // onTableDailyQueryParamsChange(params: NzTableQueryParams) {
  //   const { sort } = params;
  //   const currentSort = sort.find((item) => item.value !== null);
  //   this.sStore.pagingRequestPlanDaily.sorter = currentSort?.key ?? '';
  //   this.sStore.pagingRequestPlanDaily.orderDescending =
  //     currentSort?.value !== 'ascend';
  //   this.sStore.getPlanDailyPaging();
  //   console.log();
  // }

  onSearch() {
    this.sStore.pagingRequest.search = this.sStore.pagingRequest.search.replace(
      /[\t\n\r]/,
      ''
    );
    if (this.sStore.pagingRequest.current !== 1) {
      this.sStore.pagingRequest.current = 1;
    } else {
      this.sStore.getPlanPaging();
    }
  }

  onEditRow(id: number) {
    this.sStore.pagingExpand.clear();
    this.sStore.pagingSubRowExpand.clear();
    this.sStore.pagingExpand.add(id);

    this.sStore.getWeeklyPlanDetailPaging(id);
  }

  onEditSubRow(id: number) {
    console.log(this.sStore.pagingSubRowExpand);
    this.sStore.pagingSubRowExpand.clear();
    this.sStore.pagingSubRowExpand.add(id);
    // this.sStore.pagingRequestPlanDaily.idPlanDaily = id
    this.sStore.getPlanDailyPaging(id);
  }

  onClose() {
    this.sStore.pagingExpand.clear();
  }

  oncloseSubRow() {
    this.sStore.pagingSubRowExpand.clear();
  }

  onActive(id: number) {
    this.sStore.activeWeeklyPlan(id);
  }

  onUpdatePlanDaily(
    planDailyId: string,
    accountId: string,
    serviceAssignmentCode: string,
    shiftCode: string,
    shiftName: string,
    fullName: string
  ) {
    const modalRef = this._nzModalSvc.create({
      nzTitle: 'Cập nhật ca làm',
      nzContent: PlanDailyUpdateModalComponent,
    });

    const form = this._fb.group<PlanDailyUpdateModalApi.RequestFormGroup>({
      services: this._fb.control([]),
      staffs: this._fb.control([]),
      staff: this._fb.control({value: fullName , disabled: true}),
      shiftCode: this._fb.control(shiftCode),
    });

    modalRef.componentInstance!.form = form;
    modalRef
      .componentInstance!.clickSubmit.pipe(
        tap(() => {
          form.controls.staffs.setValue([
            {
              accountId: accountId,
              serviceAssignmentCode: serviceAssignmentCode,
              shiftCode: form.controls.shiftCode.value,
              shiftName: form.controls.shiftCode.value === "MORNING_SHIFT" ? 'Ca Sáng' : 'Ca tối',
            },
          ]);
          this.sStore.updateStaffShift({
            model: form.getRawValue(),
            id: Number(planDailyId),
            modalRef,
          });
        })
      )
      .subscribe();
  }
}
