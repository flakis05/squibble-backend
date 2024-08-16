import { Resolver } from '../../../apollo/Resolver';
import { LabelEntity, GetLabelInput, GetLabelOutput, LabelId } from '../../api/label/model';
import DataLoader from 'dataloader';
import { SquibbleDataLoader } from '../../context/ApolloContext';
import { Context } from '../../../apollo/Context';
import { Attribute } from '../../../dynamodb/model/Attribute';

export class GetLabelsResolver implements Resolver<LabelEntity[]> {
    public resolve = async (parent: any, _: any, context: Context): Promise<LabelEntity[]> => {
        if (!this.hasLabels(parent)) {
            return [];
        }
        const inputs: GetLabelInput[] = this.getLabelInputs(parent[Attribute.LABELS]);
        const dataLoader: DataLoader<GetLabelInput, GetLabelOutput> = context.dataLoader[SquibbleDataLoader.GET_LABEL];
        const output: (GetLabelOutput | Error)[] = await dataLoader.loadMany(inputs);
        const getLabelOutputs = output.filter(this.isGetLabelOutput);
        return getLabelOutputs.map((item) => item.label);
    };

    private isGetLabelOutput = (label: GetLabelOutput | Error): label is GetLabelOutput => {
        return !(label instanceof Error);
    };

    private hasLabels = (parent: any): boolean => {
        return Attribute.LABELS in parent;
    };

    private getLabelInputs = (labels: LabelId[]): GetLabelInput[] => {
        return labels.map((label) => ({
            labelId: label.labelId
        }));
    };
}
