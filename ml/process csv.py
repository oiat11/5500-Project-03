import csv
import random


def generate_ml_features(row):
    ml_features = {}

    # __ml_total_invitations: 总共邀请次数范围 (Total invitation count range)
    ml_total_invitations = random.randint(0, 50)
    ml_features['__ml_total_invitations'] = ml_total_invitations

    # __ml_total_attendance: 总共参与次数，小于等于邀请次数，参与率高的捐款人这个值也相对高一些
    attendance_probability = 0.3 + (ml_total_invitations * 0.05)      # 邀请越多，参与概率稍微提升
    attendance_probability = min(attendance_probability, 0.8)         # 参与概率上限

    ml_total_attendance = 0
    for _ in range(ml_total_invitations):
        if random.random() < attendance_probability:
            ml_total_attendance += 1
    ml_features['__ml_total_attendance'] = ml_total_attendance

    # __ml_last_invitation_attendance: 上次是否参与，如果总参与次数大于0，则有一定概率上次也参与了
    ml_last_invitation_attendance = 0
    if ml_total_attendance > 0:
        if random.random() < 0.7:                                     # 如果总参与次数多，上次参与的概率也高
            ml_last_invitation_attendance = 1
    ml_features['__ml_last_invitation_attendance'] = ml_last_invitation_attendance

    # __ml_invitation_acceptance_rate：直接算
    if ml_total_invitations > 0:
        ml_invitation_acceptance_rate = ml_total_attendance / ml_total_invitations
    else:
        ml_invitation_acceptance_rate = 0.0
    ml_features['__ml_invitation_acceptance_rate'] = ml_invitation_acceptance_rate

    # __ml_lable: 1-true, 0-false               - 根据之前的结果，随机决定是1还是0
    label_probability = 0.2                     # 基础概率
    if ml_invitation_acceptance_rate > 0.4:     # 若接受率高，提升概率
        label_probability += 0.3
    if ml_last_invitation_attendance == 1:      # 若上次参与，提升概率
        label_probability += 0.2
    if ml_total_attendance > 3:                 # 若总参与次数多，提升概率
        label_probability += 0.2
    label_probability = min(label_probability, 0.9)     # 概率上限,这里是压缩用的，如果上面调整，这里也注意调整

    if random.random() < label_probability:
        ml_label = 1
    else:
        ml_label = 0
    ml_features['__ml_lable'] = ml_label

    return ml_features


def generate_ml_features(row):
    ml_features = {}

    # --- 邀请相关特征 ---
    ml_total_invitations = random.randint(0, 50)
    ml_features['__ml_total_invitations'] = ml_total_invitations

    attendance_probability = 0.3 + (ml_total_invitations * 0.05)
    attendance_probability = min(attendance_probability, 1)

    ml_total_attendance = 0
    for _ in range(ml_total_invitations):
        if random.random() < attendance_probability:
            ml_total_attendance += 1
    ml_features['__ml_total_attendance'] = ml_total_attendance

    ml_last_invitation_attendance = 0
    if ml_total_attendance > 0:
        if random.random() < 0.7:
            ml_last_invitation_attendance = 1
    ml_features['__ml_last_invitation_attendance'] = ml_last_invitation_attendance

    ml_invitation_acceptance_rate = 0.0
    if ml_total_invitations > 0:
        ml_invitation_acceptance_rate = ml_total_attendance / ml_total_invitations
    ml_features['__ml_invitation_acceptance_rate'] = ml_invitation_acceptance_rate

    # --- 新增捐款相关特征 ---
    MAX_D = 100000

    ml_total_donations = random.randint(0, MAX_D)
    ml_features['__ml_total_donations'] = ml_total_donations

    if ml_total_donations > 0:
        ml_largest_gift = random.randint(0, ml_total_donations)
    else:
        ml_largest_gift = 0
    ml_features['__ml_largest_gift'] = ml_largest_gift

    if ml_largest_gift > 0:
        ml_last_gift_amount = random.randint(0, ml_largest_gift)
    else:
        ml_last_gift_amount = 0
    ml_features['__ml_last_gift_amount'] = ml_last_gift_amount

    # --- __ml_attendance_lable 生成逻辑 (基于出席相关特征) ---
    attendance_label_probability = 0.2  # 基础概率 (出席)

    attendance_label_probability += ml_invitation_acceptance_rate * 0.4
    attendance_label_probability += ml_last_invitation_attendance * 0.1
    attendance_label_probability += (ml_total_attendance / 50.0) * 0.3 if ml_total_attendance <= 50 else 0.3

    attendance_label_probability = max(0.0, min(attendance_label_probability, 1))

    if random.random() < attendance_label_probability:
        ml_attendance_lable = 1
    else:
        ml_attendance_lable = 0
    ml_features['__ml_attendance_lable'] = ml_attendance_lable

    # --- __ml_donation_lable 生成逻辑 (基于捐款相关特征) ---
    donation_label_probability = 0.0  # 基础概率 (捐款)

    donation_label_probability += (ml_total_donations / MAX_D) * 0.4 if ml_total_donations <= MAX_D else 0.4
    donation_label_probability += (ml_largest_gift / 50000.0) * 0.1 if ml_largest_gift <= 50000 else 0.1
    donation_label_probability += (ml_last_gift_amount / 20000.0) * 0.3 if ml_last_gift_amount <= 10000.0 else 0.3

    donation_label_probability = max(0.0, min(donation_label_probability, 0.8))

    if random.random() < donation_label_probability:
        ml_donation_lable = 1
    else:
        ml_donation_lable = 0
    ml_features['__ml_donation_lable'] = ml_donation_lable

    return ml_features


def add_ml_features_to_csv(input_csv_path, output_csv_path):
    with open(input_csv_path, mode='r', encoding='utf-8') as infile, \
         open(output_csv_path, mode='w', encoding='utf-8', newline='') as outfile:

        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames + [
            '__ml_attendance_lable',
            '__ml_donation_lable',
            '__ml_total_invitations',
            '__ml_total_attendance',
            '__ml_last_invitation_attendance',
            '__ml_invitation_acceptance_rate',
            '__ml_total_donations',
            '__ml_largest_gift',
            '__ml_last_gift_amount'
            ]
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)

        writer.writeheader()
        for row in reader:
            ml_features = generate_ml_features(row)
            row.update(ml_features)
            writer.writerow(row)

    print(f"ML features have been added to the CSV file and saved to: {output_csv_path}")


if __name__ == "__main__":
    input_file = r"C:\Users\78282\Documents\~NEU\cs5500\5500-Project-03-ml\donors.csv"
    output_file = r"C:\Users\78282\Documents\~NEU\cs5500\5500-Project-03-ml\donors_ml_separated_labels.csv"
    add_ml_features_to_csv(input_file, output_file)