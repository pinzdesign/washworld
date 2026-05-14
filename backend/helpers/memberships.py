from datetime import datetime
import calendar

def add_one_month_capped(timestamp):
    dt = datetime.fromtimestamp(timestamp)

    if dt.month == 12:
        target_year = dt.year + 1
        target_month = 1
    else:
        target_year = dt.year
        target_month = dt.month + 1

    last_day = calendar.monthrange(target_year, target_month)[1]
    target_day = min(dt.day, last_day)

    new_dt = dt.replace(year=target_year, month=target_month, day=target_day)
    return int(new_dt.timestamp())