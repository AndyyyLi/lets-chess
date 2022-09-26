export const isCreatorMode = () => o3h.Instance.playType === o3h.PlayType.Creator;

export const isAudienceMode = () => o3h.Instance.playType === o3h.PlayType.Audience;

export const sleep = function(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
