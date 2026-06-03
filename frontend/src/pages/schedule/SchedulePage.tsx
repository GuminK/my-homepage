import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { scheduleApi, type Schedule, type ScheduleCreateRequest } from '@/api/scheduleApi';
import { useAuthStore } from '@/store/authStore';

const SLOT_TIMES: string[] = [];
for (let h = 9; h < 24; h++) {
  SLOT_TIMES.push(`${String(h).padStart(2, '0')}:00`);
  SLOT_TIMES.push(`${String(h).padStart(2, '0')}:30`);
}

const SCHEDULE_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', fill: 'bg-blue-100 border-l border-r border-blue-300' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800', fill: 'bg-green-100 border-l border-r border-green-300' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800', fill: 'bg-purple-100 border-l border-r border-purple-300' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-800', fill: 'bg-orange-100 border-l border-r border-orange-300' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-800', fill: 'bg-pink-100 border-l border-r border-pink-300' },
  { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-800', fill: 'bg-teal-100 border-l border-r border-teal-300' },
  { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', fill: 'bg-red-100 border-l border-r border-red-300' },
  { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800', fill: 'bg-yellow-100 border-l border-r border-yellow-300' },
];

const getColor = (scheduleId: number) => SCHEDULE_COLORS[scheduleId % SCHEDULE_COLORS.length];

export default function SchedulePage() {
  const { user, isAdmin, isSuperAdmin, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const isManager = isAdmin || isSuperAdmin;

  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Schedule | null>(null);

  const [form, setForm] = useState<ScheduleCreateRequest>({
    reserverName: user?.nickname ?? '',
    songName: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
  });

  // 현재 달 전체 + 이전달 말일 ~ 다음달 1일까지 범위로 조회
  const monthStart = currentMonth.format('YYYY-MM-DD');
  const monthEnd = currentMonth.endOf('month').format('YYYY-MM-DD');

  const { data: schedules = [] } = useQuery({
    queryKey: ['schedules', monthStart, monthEnd],
    queryFn: () => scheduleApi.getSchedules(monthStart, monthEnd).then(r => r.data.data),
  });

  const { mutate: create, isPending: creating, error: createError } = useMutation({
    mutationFn: scheduleApi.createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowModal(false);
      resetForm();
    },
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ScheduleCreateRequest }) =>
      scheduleApi.updateSchedule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowModal(false);
      setEditTarget(null);
      resetForm();
    },
  });

  const { mutate: cancel } = useMutation({
    mutationFn: scheduleApi.deleteSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['schedules'] }),
  });

  const resetForm = () => {
    setForm({ reserverName: user?.nickname ?? '', songName: '', date: '', startTime: '09:00', endTime: '10:00' });
  };

  const openCreate = (date: string) => {
    setEditTarget(null);
    setForm(f => ({ ...f, date, startTime: '09:00', endTime: '10:00' }));
    setShowModal(true);
  };

  const openEdit = (s: Schedule) => {
    setEditTarget(s);
    setForm({
      reserverName: s.reserverName,
      songName: s.songName,
      date: s.date,
      startTime: s.startTime.slice(0, 5),
      endTime: s.endTime.slice(0, 5),
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      update({ id: editTarget.id, data: form });
    } else {
      create(form);
    }
  };

  // 달력 날짜 배열 생성
  const firstDay = currentMonth.day(); // 0=일
  const daysInMonth = currentMonth.daysInMonth();
  const today = dayjs().format('YYYY-MM-DD');
  const maxDate = dayjs().add(3, 'month').format('YYYY-MM-DD');

  const calendarDays: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      currentMonth.date(i + 1).format('YYYY-MM-DD')
    ),
  ];

  const schedulesOnDate = (date: string) =>
    schedules.filter(s => s.date === date);

  const selectedSchedules = selectedDate ? schedulesOnDate(selectedDate) : [];

  // 선택된 날의 시간 슬롯별 예약 정보
  const slotMap: Record<string, Schedule | null> = {};
  SLOT_TIMES.forEach(t => { slotMap[t] = null; });
  selectedSchedules.forEach(s => {
    const start = s.startTime.slice(0, 5);
    const end = s.endTime.slice(0, 5);
    SLOT_TIMES.forEach(t => {
      if (t >= start && t < end) slotMap[t] = s;
    });
  });

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">일정</h1>

      <div className="flex gap-6">
        {/* 달력 */}
        <div className="flex-1 bg-white rounded-lg shadow p-4">
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(m => m.subtract(1, 'month'))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ←
            </button>
            <span className="font-semibold text-lg">{currentMonth.format('YYYY년 M월')}</span>
            <button
              onClick={() => setCurrentMonth(m => m.add(1, 'month'))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              →
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <div key={d} className={`text-center text-xs font-medium py-1 ${d === '일' ? 'text-red-500' : d === '토' ? 'text-blue-500' : 'text-gray-500'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={i} />;
              const hasSchedule = schedulesOnDate(date).length > 0;
              const isToday = date === today;
              const isSelected = date === selectedDate;
              const isPast = date < today;
              const isFuture = date > maxDate;
              const dayOfWeek = dayjs(date).day();

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    relative flex flex-col items-center rounded-lg text-sm p-1 min-h-[56px]
                    ${isSelected ? 'bg-blue-50 border-2 border-blue-400 font-semibold' : isToday ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-50'}
                    ${isPast || isFuture ? 'opacity-40 cursor-default' : ''}
                    ${!isSelected && dayOfWeek === 0 ? 'text-red-500' : ''}
                    ${!isSelected && dayOfWeek === 6 ? 'text-blue-500' : ''}
                  `}
                >
                  <span className="font-medium">{dayjs(date).date()}</span>
                  {hasSchedule && (
                    <div className="w-full mt-0.5 space-y-0.5">
                      {schedulesOnDate(date).slice(0, 2).map(s => (
                        <div
                          key={s.id}
                          className={`w-full text-xs px-1 rounded truncate leading-4
                            ${getColor(s.id).bg} ${getColor(s.id).text}`}
                        >
                          {s.songName}
                        </div>
                      ))}
                      {schedulesOnDate(date).length > 2 && (
                        <div className={`text-xs text-center leading-4 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                          +{schedulesOnDate(date).length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>


        {/* 선택된 날 상세 */}
        <div className="w-72 bg-white rounded-lg shadow p-4">
          {selectedDate ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">{dayjs(selectedDate).format('M월 D일 (ddd)')}</h2>
                {isAuthenticated && selectedDate >= today && selectedDate <= maxDate && (
                  <button
                    onClick={() => openCreate(selectedDate)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    + 예약
                  </button>
                )}
              </div>

              {/* 시간 슬롯 목록 */}
              <div className="space-y-0.5 max-h-[500px] overflow-y-auto">
                {SLOT_TIMES.map(time => {
                  const s = slotMap[time];
                  const isFirst = s && s.startTime.slice(0, 5) === time;
                  const isOccupied = !!s;

                  return (
                    <div key={time} className="flex items-center gap-2 text-xs">
                      <span className="w-10 text-gray-400 flex-shrink-0">{time}</span>
                      {isOccupied ? (
                        isFirst ? (
                          <div className={`flex-1 ${getColor(s.id).bg} border ${getColor(s.id).border} rounded px-2 py-0.5 flex items-center justify-between`}>
                            <span className={`${getColor(s.id).text} font-medium truncate`}>
                              {s.reserverName} · {s.songName}
                            </span>
                            <div className="flex gap-1 ml-1 flex-shrink-0">
                              {(s.userId === user?.id || isManager) && (
                                <button onClick={() => openEdit(s)} className="text-gray-500 hover:text-blue-600">✎</button>
                              )}
                              {(s.userId === user?.id || isManager) && (
                                <button onClick={() => cancel(s.id)} className="text-gray-500 hover:text-red-600">✕</button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className={`flex-1 ${getColor(s.id).fill} h-4`} />
                        )
                      ) : (
                        <div className="flex-1 border-b border-gray-100 h-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">날짜를 선택하세요</p>
          )}
        </div>
      </div>

      {/* 예약/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">
              {editTarget ? '일정 수정' : '합주실 예약'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">날짜</label>
                <input
                  type="date"
                  value={form.date}
                  min={today}
                  max={maxDate}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">시작 시간</label>
                  <select
                    value={form.startTime}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SLOT_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">종료 시간</label>
                  <select
                    value={form.endTime}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SLOT_TIMES.filter(t => t > form.startTime).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">예약자 이름</label>
                <input
                  value={form.reserverName}
                  onChange={e => setForm(f => ({ ...f, reserverName: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">합주곡 이름</label>
                <input
                  value={form.songName}
                  onChange={e => setForm(f => ({ ...f, songName: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {createError && (
                <p className="text-red-500 text-sm">
                  {(createError as any)?.response?.data?.message ?? '예약에 실패했습니다.'}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditTarget(null); resetForm(); }}
                  className="flex-1 border py-2 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating || updating ? '처리 중...' : editTarget ? '수정' : '예약'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
