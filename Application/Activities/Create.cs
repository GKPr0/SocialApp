using MediatR;
using Domain;
using Persistence;
using FluentValidation;
using Application.Core;
using Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Activities;

public class Create
{
    public class Command: IRequest<Result<Unit>>
    {
        public Activity Activity {get; set;}
    }

    public class CommandValidator : AbstractValidator<Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.Activity).SetValidator(new ActivityValidator());
        }
    }

    public class Handler : IRequestHandler<Command, Result<Unit>>
    {
        private readonly DataContext context;
        private readonly IUserAccessor userAccessor;

        public Handler(DataContext context, IUserAccessor userAccessor)
        {
            this.context = context;
            this.userAccessor = userAccessor;
        }
    

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await context.Users.FirstOrDefaultAsync(x => x.UserName == userAccessor.GetUserName());

            var attendee = new ActivityAttendee {
                Activity = request.Activity,
                AppUser = user,
                IsHost = true
            };

            request.Activity.Attendees.Add(attendee);

            context.Activities.Add(request.Activity);
            
            var result = await context.SaveChangesAsync() > 0;

            if (result == false)
                return Result<Unit>.Failure("Failed to create activity");

            return Result<Unit>.Success(Unit.Value);
        }
    }    
}
