import pandas as pd
import numpy as np

df0 = pd.DataFrame()
df1 = pd.DataFrame()
variables0 = {"files": [], "columns": [], "group": 0}
variables1 = {"files": [], "columns": [], "group": 1}

dtypes = {
    "altitude": np.float64,
    "date time": object,
    "flight time": np.float64,
    "fuel flow": np.float64,
    "fuel vol.": np.float64,
    "ground speed": np.float64,
    "idxFile": np.float64,
    "ind. air speed": np.float64,
    "n1 1": np.float64,
    "n2 1": np.float64,
    "nr": np.float64,
    "oat": np.float64,
    "oil pressure 1": np.float64,
    "oil temp. 1": np.float64,
    "phase_no": np.float64,
    "power": np.float64,
    "static pressure": np.float64,
    "take off switch": np.float64,
    "torque 1": np.float64,
    "tot 1": np.float64,
}


def add_selected_files(data, group, args):
    print(group)
    if group == 0:
        return add_selected_files0(data, args)
    elif group == 1:
        return add_selected_files1(data, args)


def add_selected_files0(data, args):
    global df0

    d = pd.read_json(data, orient='records', dtype=dtypes)
    if not (df0.empty and d.empty):
        # marche pas
        # d.replace('', np.nan, regex=True)
        # d.fillna(method='ffill')
        # print(d["power"])
        cols = d.columns
        cols = cols.map(lambda x: x.replace(' ', '_').replace('.', '') if isinstance(x, (bytes, str)) else x)
        d.columns = cols
        frames = [df0, d]
        df0 = pd.concat(frames).drop_duplicates().reset_index(drop=True)

        variables0["files"] = list(df0["idxFile"].unique())
        variables0["columns"] = list(df0.columns.values)
        # print(df0.dtypes)
    else:
        variables0["files"] = []
        variables0["columns"] = []

    return variables0


def add_selected_files1(data, args):
    global df1

    d = pd.read_json(data, orient='records', dtype=dtypes)
    if not (df1.empty and d.empty):
        # marche pas
        # d.replace('', np.nan, regex=True)
        # d.fillna(method='ffill')
        # print(d["power"])
        cols = d.columns
        cols = cols.map(lambda x: x.replace(' ', '_').replace('.', '') if isinstance(x, (bytes, str)) else x)
        d.columns = cols
        frames = [df1, d]
        df1 = pd.concat(frames).drop_duplicates().reset_index(drop=True)
        # debug_df()
        # print(list(d["idxFile"].unique()))

        variables1["files"] = list(df1["idxFile"].unique())
        variables1["columns"] = list(df1.columns.values)
        # print(df1.dtypes)
        # print(list(df1["idxFile"].unique()))
    else:
        variables1["files"] = []
        variables1["columns"] = []

    return variables1


def get_pc_data(data, group, args):
    df = df0

    if group == 1:
        print("DataFrame Group 1")
        df = df1

    if args:
        columns = args[0]
        lims = args[1]
    else:
        columns = df.columns.values

    filtered = df.loc[df["idxFile"].isin(data)]
    if lims:
        query_string = ''
        for key, value in lims.items():
            print(key, value)
            # TODO if pas beau
            if not query_string:
                query_string += key + ' < ' + str(value[0]) + ' and ' + key + ' >= ' + str(value[1])
            else:
                query_string += ' and ' + key + ' < ' + str(value[0]) + ' and ' + key + ' >= ' + str(value[1])
        # limited = df.loc[(df[list(lims)] == pd.Series(lims)).all(axis=1)]

        # print(query_string)

        limited = df.query(query_string)
        # limited = df.loc[df["phase_no"] == '1']

    else:
        print("no lims")
        limited = filtered

    return {"pcData": create_dict(limited[columns]), "group": group, "pcColumns": list(columns)}


def get_lc_sp_data(data, group, args):
    df = df0

    if group == 1:
        print("DataFrame Group 1")
        df = df1

    if args:
        feature_x = args[0]
        feature_y = args[1]
    else:
        feature_x = "altitude"
        feature_y = "fuel_flow"
    return {"lcspData": create_dict(df[df["idxFile"] == data][["flight_time", feature_x, feature_y]]), "group": group,
            "lcspColumns": [feature_x, feature_y]}


def get_lc_sp_generalized_data(data, group, args):
    df = df0

    if group == 1:
        print("DataFrame Group 1")
        df = df1

    if args:
        feature_x = args[0]
        feature_y = args[1]
    else:
        feature_x = "altitude"
        feature_y = "fuel_flow"

    grouped = df.groupby(by="idxFile", as_index=False) \
        .apply(lambda x: x[["idxFile", "flight_time", feature_x, feature_y]].to_dict('r')) \
        .reset_index() \
        .rename(columns={0: "data"})
    # ["data"].tolist()

    return {"lcspGeneralizedData": create_dict(grouped), "group": group,
            "lcspGeneralizedColumns": [feature_x, feature_y]}

def get_sp_generalized_data(data, group, args):
    frames = [df0, df1]
    df = pd.concat(frames).drop_duplicates().reset_index(drop=True)

    return {"spGeneralizedData": create_dict(df),
            "spGeneralizedFiles": list(df["idxFile"].unique()),
            "spGeneralizedColumns": list(df.columns.values)}


# def get_list_files(data, args):
#     return list(df["idxFile"].unique())
#
#
# def get_columns(data, args):
#     return list(df.columns.values)


def delete_file(data, group, args):
    if group == 0:
        return delete_file0(data, args)
    elif group == 1:
        return delete_file1(data, args)


def delete_file0(data, args):
    global df0
    df0 = df0.loc[df0["idxFile"] != data]

    if not df0.empty:
        variables0["files"] = list(df0["idxFile"].unique())
        variables0["columns"] = list(df0.columns.values)
    else:
        variables0["files"] = []
        variables0["columns"] = []

    return variables0


def delete_file1(data, args):
    global df1
    df = df1[df1["idxFile"] == data]
    list_to_drop = df.index.values
    df1.drop(list_to_drop, inplace=True)
    # debug_df()

    if not df1.empty:
        variables1["files"] = list(df1["idxFile"].unique())
        variables1["columns"] = list(df1.columns.values)
    else:
        variables1["files"] = []
        variables1["columns"] = []

    return variables1


def debug_df():
    print(list(df1["idxFile"].unique()))


def create_df(json_str):
    """
    Create DataFrame from JSON file
    :param json_str: a JSON string
    :return: a pandas DataFrame
    """
    df = pd.read_json(json_str, orient='records')
    return df


def create_df2(dict):
    """
    Create DataFrame from a dictionary
    :param dict: a dictionary
    :return: a pandas DataFrame
    """
    df = pd.DataFrame(dict)
    return df


def remove_categorical_var(df):
    """
    Keep numerical columns only
    :param df: a pandas DataFrame
    :return: a pandas DataFrame that contains only numerical columns
    """
    df_cleaned = df.select_dtypes(['number'])
    return df_cleaned


def remove_categorical_var2(df):
    """
    Keep numerical columns only
    :param df: a pandas DataFrame
    :return: a pandas DataFrame that contains only numerical columns
    """
    # Suppose first column is necesseraly the datetime column
    datetime = df["date time"]  # Store datetime column somewhere else
    # datetime = df.iloc[:, 0]  # Store datetime column somewhere else
    print(datetime.dtypes)
    df = df.apply(pd.to_numeric, errors='coerce')
    df_cleaned = df.dropna(axis=1)

    frames = [datetime, df_cleaned]

    concatenation = pd.concat(frames, axis=1)
    return concatenation


def remove_nan(df):
    """
    To be improved
    Currently : remove every row with at least one empty value

    :param df: a pandas DataFrame
    :return: a pandas DataFrame
    """
    df_cleaned = df.dropna(axis=0)
    return df_cleaned


def create_json(df):
    """
    Create new JSON file from DataFrame
    :param df: a pandas DataFrame
    :return: a new JSON file
    """
    json_str = df.to_json(orient='records')
    return json_str


def create_dict(df):
    """
    Create new dictionary from DataFrame
    :param df: a pandas DataFrame
    :return: a new dictionary
    """
    dict = df.to_dict(orient='records')
    return dict


def select_columns(df, columns):
    """
    Return a new DataFrame with selected columns
    :param df: a pandas DataFrame
    :param columns: a list of columns we want to see
    :return: a pandas DataFrame with the selected columns only
    """
    print("COLUMNS :", columns)
    return df[columns]


def initialize_datetime(df):
    """
    :param df: an input DataFrame
    :return: new DataFrame with datetime intialized with first value
    """

    print("Re-initiate date time")
    df_new = df.copy()
    # df_init = df[["indexFile", "date time"]].copy()
    #
    # df_init["date time"] = pd.to_datetime(df_new[["date time"]], format="%Y-%m-%d %H:%M:%S")
    # df_init = df_init.groupby("indexFile").min()
    # print(df_init)

    df_new["date time"] = pd.to_datetime(df_new["date time"], format="%Y-%m-%d %H:%M:%S") - \
                          pd.to_datetime(df_new.loc[0, "date time"], format="%Y-%m-%d %H:%M:%S")

    df_new["date time"] = df_new["date time"].apply(lambda x: str(x).split(' ')[2])

    return df_new


if __name__ == '__main__':
    print("ok")
