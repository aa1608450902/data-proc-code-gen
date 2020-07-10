import os
import copy
import json
import toml
import logging
from operator import itemgetter
from . import dp_core
from . import dp_json
from . import proxy_db
from .stage_frame import BaseStage


_default_context = toml.load(
    os.path.dirname(__file__) + '/../config/stage_join_glue.toml'
)


class StageJoinGlue(BaseStage):
    _ctx = _default_context

    def __init__(self):
        self._base = self._ctx['base']
        self._jk_a = "display_sn"
        self._jk_1 = "main_barcode_17"
        self._jk_2 = "serial_number"
        self._jk_3 = "route_id"
        self._jk_4 = "model_id"
        self._jk_5 = "frame_sn"
        self._selected_1 = {"serial_number": "serial_number"}
        self._selected_2 = {"site": "site", "project": "project", "build": "build", "route_id": "route_id"}
        self._selected_3 = {"model_id": "model_id"}
        self._selected_5 = {"machine_qrcode": "machine_qrcode"}
        super(StageJoinGlue, self).__init__(self._base)
        self._proxy_db = proxy_db.create_proxy("mongo", "172.16.1.9", 27017)
        self._co_success = self._proxy_db['d5x_join']['t_glue']
        self._co_failure = self._proxy_db['d5x_join']['t_glue_f']
        self._failure = []

    def _process(self, batch_raw: list):
        self._failure.clear()
        _batch_seq = dp_core.dp_filter(
            batch_raw,
            lambda every: self._jk_a in every and every[self._jk_a] is not None
        )
        _collect_1 = []
        _collect_5 = []
        dp_core.dp_multi_foreach(
            _batch_seq, [
                lambda every: _collect_1.append(every[self._jk_a][0:17])
                if self._jk_a in every and every[self._jk_a] is not None else None,
                lambda every: every.update({self._jk_1: every[self._jk_a][0:17]})
                if self._jk_a in every and every[self._jk_a] is not None else None,
                lambda every: _collect_5.append(every[self._jk_5]),
            ]
        )
        _collect_1 = list(set(_collect_1))
        _collect_5 = list(set(_collect_5))
        _queried_5 = self._proxy_db['d5x']['oeedj_main'].find({"unit_serial_number": {"$in": _collect_5}})
        _queried_5.sort(key=lambda kv: kv['time_sec'])
        _indexed_5 = dp_core.dp_index(_queried_5, "unit_serial_number")
        _queried_1 = self._proxy_db['d5x']['sys_attr'].find({self._jk_1: {"$in": _collect_1}})
        _indexed_1 = dp_core.dp_index(_queried_1, self._jk_1)
        _collect_2 = []
        dp_core.dp_foreach(
            _queried_1,
            lambda every: _collect_2.append(every[self._jk_2])
        )
        _collect_2 = list(set(_collect_2))
        _queried_2 = self._proxy_db['d5x_join']['t_g_sn_travel'].find({self._jk_2: {"$in": _collect_2}})
        _indexed_2 = dp_core.dp_index(_queried_2, self._jk_2)
        _collect_3 = []
        dp_core.dp_foreach(
            _queried_2,
            lambda every: _collect_3.append(every[self._jk_3])
        )
        _collect_3 = list(set(_collect_3))
        _queried_3 = self._proxy_db['d5x']['oee_model'].find({self._jk_3: {"$in": _collect_3}})
        _indexed_3 = dp_core.dp_index(_queried_3, self._jk_3)
        _collect_4 = []
        dp_core.dp_foreach(
            _queried_3,
            lambda every: _collect_4.append(every[self._jk_4])
        )
        _collect_4 = list(set(_collect_4))
        _queried_4 = self._proxy_db['d5x']['oee_glue_tolerance'].find({self._jk_4: {"$in": _collect_4}})
        dp_core.dp_foreach(
            _queried_4,
            lambda every: every.update({'update_time': str(every['update_time'])})
        )
        _indexed_4 = {}
        dp_core.dp_foreach(
            _queried_4,
            lambda every: dp_json.dp_merge_up(_indexed_4, {every[self._jk_4]: {every['inspection_point']: every}})
        )
        ##########################################################################################
        # The following is the real join processing.
        _insert_seq = []
        for every_raw in _batch_seq:
            every_orig = copy.deepcopy(every_raw)
            try:
                if not StageJoinGlue._do_join(every_raw, self._jk_5, _indexed_5, self._selected_5):
                    raise RuntimeError("Not found join part (%s)" % self._jk_5)
                if not StageJoinGlue._do_join(every_raw, self._jk_1, _indexed_1, self._selected_1):
                    raise RuntimeError("Not found join part (%s)" % self._jk_1)
                if not StageJoinGlue._do_join(every_raw, self._jk_2, _indexed_2, self._selected_2):
                    raise RuntimeError("Not found join part (%s)" % self._jk_2)
                if not StageJoinGlue._do_join(every_raw, self._jk_3, _indexed_3, self._selected_3):
                    raise RuntimeError("Not found join part (%s)" % self._jk_3)
                _jv_4 = every_raw[self._jk_4]
                if _jv_4 not in _indexed_4:
                    raise RuntimeError("Not found join part (%s)" % self._jk_4)
                every_raw = self._do_build(every_raw, _indexed_4[_jv_4])
                every_raw = self._clean(every_raw)
                _insert_seq.append(every_raw)
            except Exception as e:
                self._failure.append(every_orig)
                logging.error(str(e))
        return _insert_seq

    def _post(self, batch_new: list):
        self._co_failure.bulk_write(self._failure)
        self._co_success.bulk_write(batch_new)
        logging.info("[ insert] number: " + str(len(batch_new)))
        logging.info("[failure] number: " + str(len(self._failure)))
        return None

    def fast_init(self):
        pass

    def fast_proc(self, batch_raw: list):
        self._post(self._process(batch_raw))
        return None

    @staticmethod
    def _do_join(every_raw: dict, _jk: str, _indexed: dict, _selected: dict):
        _jv = every_raw[_jk]
        if _jv not in _indexed:
            return False
        every_raw.update(dp_core.dp_select_as(_indexed[_jv], _selected))
        return True

    def _build(self, every_raw: dict, _builder: dict, points: dict, _op: str):
        _prefix = "P"
        _part = []
        _sorted: list = sorted(_builder.items(), key=itemgetter(0))
        _result = True
        for every in _sorted:
            point = _prefix + str(every[0])
            upper_limit = points[point]['max_glue_' + _op]
            lower_limit = points[point]['min_glue_' + _op]
            if lower_limit <= _builder[every[0]] <= upper_limit:
                _part.append({
                    "test": point,
                    "value": _builder[every[0]],
                    'min': lower_limit,
                    'max': upper_limit,
                    "result": True,
                })
            else:
                _part.append({
                    "test": point,
                    "value": _builder[every[0]],
                    'min': lower_limit,
                    'max': upper_limit,
                    "result": False,
                })
                _result = False
        every_raw.update({
            _op + "_result": _result,
            _op: _part
        })

    def _do_build(self, every_raw: dict, points: dict):
        _builder_1 = {}  # gap
        _builder_2 = {}  # width
        _builder_3 = {}  # height
        for k, v in every_raw.items():
            if "gluegapaverage_" in k:
                _builder_1[int(k[15:])] = float(v)
            elif "gluewidthaverage_" in k:
                _builder_2[int(k[17:])] = float(v)
            elif "glueheightaverage_" in k:
                _builder_3[int(k[18:])] = float(v)
        self._build(every_raw, _builder_1, points, 'gap')
        self._build(every_raw, _builder_2, points, 'width')
        self._build(every_raw, _builder_3, points, 'height')
        return every_raw

    def _clean(self, every_raw: dict):
        every = {}
        for k, v in every_raw.items():
            if "gluegap" in k or "gluewidth" in k or "glueheight" in k or "gluearea" in k or 'id' == k:
                pass
            elif "update_time" == k:
                every[k] = str(v)
            else:
                every[k] = v
        return every
