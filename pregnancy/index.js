function calculatePregnancyDuration() {
  const startDate = moment('2024-06-18');
  const today = moment();
  const dueDate = moment(startDate).add(40, 'weeks');

  const duration = moment.duration(today.diff(startDate));
  const months = Math.floor(duration.asMonths());
  const weeks = Math.floor(duration.asWeeks());
  const days = duration.days();

  const totalDuration = moment.duration(dueDate.diff(startDate));
  const progress = (duration.asWeeks() / totalDuration.asWeeks()) * 100;

  document.getElementById('result').innerHTML = `
      <p>Pregnancy duration: ${months} months, ${weeks} weeks, and ${days} days</p>
      <p>Expected due date: ${dueDate.format('MMMM D, YYYY')}</p>
      <p>Progress: ${progress.toFixed(2)}%</p>
  `;

  document.getElementById('progress').style.width = `${progress}%`;
}

calculatePregnancyDuration();
setInterval(calculatePregnancyDuration, 86400000); // Update every 24 hours