using MediatR;
using Domain;
using Persistence;

namespace Application.Activities;

public class Create
{
    public class Command: IRequest
    {
        public Activity Activity {get; set;}
    }

    public class Handler : IRequestHandler<Command>
    {
        private readonly DataContext context;
        public Handler(DataContext context)
        {
            this.context = context;
        }

        public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
        {
            context.Activities.Add(request.Activity);
            var success = await context.SaveChangesAsync() > 0;

            if (success) return Unit.Value;

            throw new Exception("Problem saving changes");
        }
    }    
}
