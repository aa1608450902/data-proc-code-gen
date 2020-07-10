__type__ = '__type__'


def dp_flat(_solid: dict, remove_type=True):
    _r = {__type__: {}}

    def _loop(_ml: dict, _d: dict, _pre: str = None):
        for k, v in _d.items():
            ck = str(k) if _pre is None else _pre + "." + str(k)
            if ck not in _ml[__type__]:
                _ml[__type__][ck] = type(k)
            if isinstance(v, dict):
                _loop(_ml, v, ck)
            else:
                _ml[ck] = v
    _loop(_r, _solid)
    if remove_type:
        del _r[__type__]
    return _r


def dp_solid(_flat: dict):
    _r = {}
    for k, v in _flat.items():
        if k == __type__:
            continue
        ks = k.split('.')
        _last_r = _r
        for ki in range(0, len(ks)):
            if ki != len(ks) - 1:
                if __type__ in _flat:
                    _type_cls = _flat[__type__]['.'.join(ks[0: ki + 1])]
                    _k = _type_cls(ks[ki]) if _type_cls is not bool \
                        else True if ks[ki] == 'True' else False
                    if _k not in _last_r:
                        _last_r[_k] = {}
                    _last_r = _last_r[_k]
                else:
                    if ks[ki] not in _last_r:
                        _last_r[ks[ki]] = {}
                    _last_r = _last_r[ks[ki]]
            else:
                if __type__ in _flat:
                    _type_cls = _flat[__type__][k]
                    _k = _type_cls(ks[ki]) if _type_cls is not bool \
                        else True if ks[ki] == 'True' else False
                    _last_r[_k] = v
                else:
                    _last_r[ks[ki]] = v
    return _r


def dp_merge(_dt1: dict, _dt2: dict):
    _va1 = dp_flat(_dt1, remove_type=False)
    _va2 = dp_flat(_dt2, remove_type=False)
    _tps = {**_va1[__type__], **_va2[__type__]}
    _va = {**_va1, **_va2, **{__type__: _tps}}
    return dp_solid(_va)


def dp_merge_up(_dt1: dict, _dt2: dict, merge_list=False):

    def _loop(_r: dict, _d: dict, _pre: list = None):
        for _k, _v in _d.items():
            _pre_c = [_k] if _pre is None else _pre + [_k]
            if isinstance(_v, dict):
                _loop(_r, _v, _pre_c)
            else:
                _last = _r
                for ki in range(0, len(_pre_c)):
                    if ki == len(_pre_c) - 1:
                        if merge_list:
                            if _pre_c[ki] in _last \
                                    and isinstance(_last[_pre_c[ki]], list) \
                                    and isinstance(_v, list):
                                _last[_pre_c[ki]] = _last[_pre_c[ki]] + _v
                            else:
                                _last[_pre_c[ki]] = _v
                        else:
                            _last[_pre_c[ki]] = _v
                        break
                    if _pre_c[ki] not in _last:
                        _last[_pre_c[ki]] = {}
                    _last = _last[_pre_c[ki]]

    _loop(_dt1, _dt2, None)
