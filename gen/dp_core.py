import json
import logging


def dp_select(data: dict, select_keys: list) -> dict:
    return {k: v for k, v in data.items() if k in select_keys}


def dp_select_as(data: dict, select_keys: dict) -> dict:
    return {select_keys[k]: v for k, v in data.items() if k in select_keys}


def dp_filter(data: list, __function) -> list:
    return list(filter(__function, data))


def dp_index(data: list, index_key: str) -> dict:
    return {every[index_key]: every for every in data}


def dp_multi_index(data: list, index_keys: list) -> dict:
    return {"".join([str(every[k]) for k in index_keys]): every for every in data}


def dp_collect(
        data: list,
        closure: type(dp_index),
        __filter: type(dp_index) = None):
    for every in data:
        if __filter is None:
            closure(every)
            continue
        if __filter(every):
            closure(every)


def dp_foreach(data: list, closure: type(dp_index)):
    for every in data:
        try:
            closure(every)
        except Exception as e:
            logging.info("foreach error " + str(e))


def dp_multi_foreach(data: list, closures: list):
    for every in data:
        for closure in closures:
            try:
                closure(every)
            except Exception as e:
                logging.info("multi_foreach error " + str(e) + ", origin data: " + str(json.dumps(every)))


def dp_map(data: list, closure):
    return list(map(closure, data))


def dp_multi_map(data: list, closures: list):
    seq_data = []
    for every in data:
        every_r = every
        for closure in closures:
            every_r = closure(every_r)
        seq_data.append(every_r)
    return seq_data
