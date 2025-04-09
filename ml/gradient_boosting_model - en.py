import pandas as pd
import numpy as np
import random
from sklearn.model_selection import train_test_split
from lightgbm import LGBMClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score

# Load Data
data = pd.read_csv(r"C:\Users\78282\Documents\~NEU\cs5500\5500-Project-03-ml\donors_ml_separated_labels.csv")

# --- Attendance Model ---
print("\n===== Attendance Model =====")
attendance_label = '__ml_attendance_lable'
attendance_features = [
    '__ml_total_invitations',
    '__ml_total_attendance',
    '__ml_last_invitation_attendance',
    '__ml_invitation_acceptance_rate'
]

X_attendance = data[attendance_features]
y_attendance = data[attendance_label]
X_train_att, X_test_att, y_train_att, y_test_att = train_test_split(X_attendance, y_attendance, test_size=0.2, random_state=42)


# Gradient Boosting Tree - Attendance Model
lgbm_model_att = LGBMClassifier(random_state=42)
lgbm_model_att.fit(X_train_att, y_train_att)
y_pred_lgbm_att = lgbm_model_att.predict(X_test_att) # Add class prediction
y_prob_lgbm_att = lgbm_model_att.predict_proba(X_test_att)[:, 1]
print("\n--- Gradient Boosting Tree (Attendance) ---")
print(f"Accuracy: {accuracy_score(y_test_att, y_pred_lgbm_att)}") # Add accuracy
print(f"AUC-ROC: {roc_auc_score(y_test_att, y_prob_lgbm_att)}")
print("Classification Report:\n", classification_report(y_test_att, y_pred_lgbm_att)) # Add classification report
feature_importances_lgbm_att = pd.DataFrame({'feature': attendance_features, 'importance': lgbm_model_att.feature_importances_})
feature_importances_lgbm_att = feature_importances_lgbm_att.sort_values('importance', ascending=False)
print("\nFeature Importance:")
print(feature_importances_lgbm_att)


donor_scores_lgbm_att = pd.DataFrame({'donor_index': data.index, 'lgbm_attendance_score': lgbm_model_att.predict_proba(X_attendance)[:, 1]})
donor_scores_lgbm_att = donor_scores_lgbm_att.sort_values('lgbm_attendance_score', ascending=False)
"""
print("\n===== Gradient Boosting Tree Attendance Scores (Top 10) =====")
print(donor_scores_lgbm_att.head(10))
"""


# --- Donation Model ---
print("\n===== Donation Model =====")
donation_label = '__ml_donation_lable'
donation_features = [
    '__ml_total_donations',
    '__ml_largest_gift',
    '__ml_last_gift_amount'
]

X_donation = data[donation_features]
y_donation = data[donation_label]
X_train_don, X_test_don, y_train_don, y_test_don = train_test_split(X_donation, y_donation, test_size=0.2, random_state=42)


# Gradient Boosting Tree - Donation Model
lgbm_model_don = LGBMClassifier(
    random_state=42, learning_rate=0.1, n_estimators=100, reg_lambda=0.1
    )
lgbm_model_don.fit(X_train_don, y_train_don)
y_pred_lgbm_don = lgbm_model_don.predict(X_test_don) # Add class prediction
y_prob_lgbm_don = lgbm_model_don.predict_proba(X_test_don)[:, 1]
print("\n--- Gradient Boosting Tree (Donation) ---")
print(f"Accuracy: {accuracy_score(y_test_don, y_pred_lgbm_don)}") # Add accuracy
print(f"AUC-ROC: {roc_auc_score(y_test_don, y_prob_lgbm_don)}")
print("Classification Report:\n", classification_report(y_test_don, y_pred_lgbm_don)) # Add classification report
feature_importances_lgbm_don = pd.DataFrame({'feature': donation_features, 'importance': lgbm_model_don.feature_importances_})
feature_importances_lgbm_don = feature_importances_lgbm_don.sort_values('importance', ascending=False)
print("\nFeature Importance:")
print(feature_importances_lgbm_don)


donor_scores_lgbm_don = pd.DataFrame({'donor_index': data.index, 'lgbm_donation_score': lgbm_model_don.predict_proba(X_donation)[:, 1]})
donor_scores_lgbm_don = donor_scores_lgbm_don.sort_values('lgbm_donation_score', ascending=False)
"""
print("\n\n===== Gradient Boosting Tree Donation Scores (Top 10) =====")
print(donor_scores_lgbm_don.head(10))
"""

# ---  Combined Scores and Ranking ---

# Get donor_index (for consistency, get from donor_scores_lgbm_att)
donor_index = donor_scores_lgbm_att['donor_index']


# Gradient Boosting Tree Combined Score
combined_lgbm_score = np.round(np.power(
    donor_scores_lgbm_att['lgbm_attendance_score'].values + donor_scores_lgbm_don['lgbm_donation_score'].values, 2.4
) * 1000, 0).astype(int)
donor_scores_lgbm_combined = pd.DataFrame({'donor_index': donor_index, 'lgbm_combined_score': combined_lgbm_score})
donor_scores_lgbm_combined = donor_scores_lgbm_combined.sort_values('lgbm_combined_score', ascending=False)

# print("\n===== Gradient Boosting Tree Combined Scores (Top 10) =====")
# print(donor_scores_lgbm_combined.head(10))

top10_combined_scores = donor_scores_lgbm_combined.head(10)
top10_donor_indices = top10_combined_scores['donor_index'].tolist()
top10_combined_scores = top10_combined_scores.set_index('donor_index')
top10_data = data.loc[top10_donor_indices]

ml_label_columns = [
    '__ml_total_attendance',
    '__ml_last_invitation_attendance',
    '__ml_invitation_acceptance_rate',
    '__ml_total_donations',
    '__ml_largest_gift',
    '__ml_last_gift_amount'
]
top10_ml_labels = top10_data[ml_label_columns]
merged_top10_info = top10_combined_scores.join(top10_ml_labels)

print("\n===== Gradient Boosting Tree Combined Scores (Top 10) =====")
print(merged_top10_info)

# --- Random 10 Donors with Combined Score and Specific __ml Labels ---
random_donor_indices = random.sample(donor_scores_lgbm_combined['donor_index'].tolist(), 10)
random_donors_combined_scores = donor_scores_lgbm_combined[donor_scores_lgbm_combined['donor_index'].isin(random_donor_indices)]
random_donors_combined_scores = random_donors_combined_scores.set_index('donor_index')
random_donors_data = data.loc[random_donor_indices]

ml_label_columns = [
    '__ml_total_attendance',
    '__ml_last_invitation_attendance',
    '__ml_invitation_acceptance_rate',
    '__ml_total_donations',
    '__ml_largest_gift',
    '__ml_last_gift_amount'
]
random_donors_ml_labels = random_donors_data[ml_label_columns]
merged_random_donors_info = random_donors_combined_scores.join(random_donors_ml_labels)

print("\n===== Gradient Boosting Tree Combined Scores (Random 10) =====")
print(merged_random_donors_info)