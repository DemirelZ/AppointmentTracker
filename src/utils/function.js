import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from 'date-fns';

export const calculateTimeLeft = appointmentDate => {
  const currentTime = new Date();
  const targetDate = new Date(appointmentDate);

  // Eğer tarih geçmişse, "Zaman geçti" döndür
  if (currentTime > targetDate) {
    return {
      timeLeft: 'Zaman geçti',
      containerColor: '#FFCDD2', // Kırmızı (açık kırmızı tonunda)
    };
  }

  // Gün farkını hesapla
  const daysLeft = differenceInDays(targetDate, currentTime);
  // Saat farkını hesapla (günler hariç)
  const hoursLeft = differenceInHours(targetDate, currentTime) % 24;
  // Dakika farkını hesapla (saatler hariç)
  const minutesLeft = differenceInMinutes(targetDate, currentTime) % 60;

  // Eğer 1 günden fazla zaman kaldıysa sadece gün ve saati göster
  if (daysLeft > 0) {
    return {
      timeLeft: `${daysLeft} gün ${hoursLeft} saat`,
      containerColor: '#C8E6C9', // Yeşil (açık yeşil tonunda)
    };
  }

  // Eğer 1 günden az zaman kaldıysa saat ve dakikayı göster
  return {
    timeLeft: `${hoursLeft} saat ${minutesLeft} dakika`,
    containerColor: '#C8E6C9', // Yeşil (açık yeşil tonunda)
  };
};
